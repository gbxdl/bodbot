import datetime
import unicodedata
from typing import TypedDict

TONNETJE = 100_000
SPOTS_PER_TEAM = 8
BASELINE_BEST_AVG = 1500.0

GIRO_FAVORITES_RAW = ["Jonas Vingegaard", "Jai Hindley", "Egan Bernal"]


def _name_tokens(name: str | None) -> set[str]:
    if not name:
        return set()
    nfkd = unicodedata.normalize("NFKD", name)
    ascii_name = "".join(c for c in nfkd if not unicodedata.combining(c)).lower()
    return set(ascii_name.split())


GIRO_FAVORITE_TOKENS: list[set[str]] = [_name_tokens(n) for n in GIRO_FAVORITES_RAW]


def _is_favorite(rider_name: str | None) -> bool:
    rider_tokens = _name_tokens(rider_name)
    return any(fav.issubset(rider_tokens) for fav in GIRO_FAVORITE_TOKENS)

# - kijkt naar pointsPerSeasonHistory (recent eerst, huidige jaar gefilterd)
# - vergelijkt gemiddelde van laatste 2 seizoenen tegen de 2 daarvoor
# - kwaliteitsdrempel: alleen bieden als renner in de buurt komt van de beste tot nu toe
# - drempel zakt continu met "relax" = max(progress, slot_pressure):
#   begin van veiling = pickerig, einde = alles is goed; ook lager als plekken vrij blijven
# - panic_mode (alleen op slot_pressure) zet flat/decliner-filters uit voor 1-tonnetje fillers
# - bod = minimum-om-te-winnen, escaleert pas tot valuation als er tegen geboden wordt
# - rookies (1 seizoen) krijgen af en toe een gokje voor een tonnetje

class TeamEntry(TypedDict):
    name: str
    amount: int
    comment: str | None

class BidEntry(TypedDict):
    player: str
    amount: int
    comment: str | None

class YouState(TypedDict):
    moneyLeft: int
    riders: list[TeamEntry]

class OtherState(TypedDict):
    key: str
    moneyLeft: int
    riders: list[TeamEntry]

class PointsPerSpeciality(TypedDict):
    oneDayRaces: int | None
    gc: int | None
    timeTrial: int | None
    sprint: int | None
    climber: int | None
    hills: int | None

class PointsPerSeason(TypedDict):
    season: int
    points: int
    rank: int

class RiderInfo(TypedDict):
    name: str | None
    nationality: str | None
    birthdate: str | None
    placeOfBirth: str | None
    currentTeam: str | None
    height: float | None
    weight: float | None
    imageUrl: str | None
    pointsPerSpeciality: PointsPerSpeciality | None
    pointsPerSeasonHistory: list[PointsPerSeason] | None

class BotResponse(TypedDict):
    amount: int | None
    comment: str


def _avg(seasons: list[PointsPerSeason]) -> float:
    if not seasons:
        return 0.0
    return sum((s.get("points") or 0) for s in seasons) / len(seasons)


def _round_to_tonnetje(amount: int) -> int:
    return (amount // TONNETJE) * TONNETJE


_best_recent_avg: float = 0.0


def bot(
    rider: str,
    rider_bib: int,
    highest_bid: int | None,
    highest_bid_by: str | None,
    bids: list[BidEntry],
    you: YouState,
    others: list[OtherState],
    upcoming_riders: list[str],
    previous_riders: list[str],
    rider_info: RiderInfo | None,
) -> BotResponse:
    global _best_recent_avg

    if not previous_riders and highest_bid is None and not bids:
        _best_recent_avg = 0.0

    money_left = you["moneyLeft"]
    base_bid = (highest_bid or 0) + TONNETJE

    slots_left = max(0, SPOTS_PER_TEAM - len(you.get("riders") or []))
    reserve = max(0, slots_left - 1) * TONNETJE  # 1 tonnetje per overige plek na deze
    max_spend = max(0, money_left - reserve)

    min_bid = min(base_bid, max_spend)

    upcoming = len(upcoming_riders)
    prev = len(previous_riders)
    slot_pressure = slots_left / max(upcoming + 1, 1)
    progress = prev / max(prev + upcoming + 1, 1)
    relax = max(progress, slot_pressure)
    panic_mode = slot_pressure >= 0.5
    uncontested = (highest_bid or 0) == 0
    panic_filler_bid = TONNETJE if uncontested and max_spend >= TONNETJE else None

    raw_history = (rider_info or {}).get("pointsPerSeasonHistory") or []
    current_year = datetime.date.today().year
    history = [s for s in raw_history if (s.get("season") or 0) < current_year]

    if _is_favorite(rider):
        recent_avg_fav = _avg(history[:2]) if history else 0.0
        valuation_fav = _round_to_tonnetje(max(int(recent_avg_fav * 2500), 8_000_000))
        if valuation_fav < min_bid:
            return {"amount": None, "comment": f"jammer, {rider} wordt te duur"}
        target_fav = _round_to_tonnetje(min(min_bid, max_spend))
        if target_fav < base_bid:
            return {"amount": None, "comment": "geen centjes meer voor de favo"}
        suffix = "deze MOET ik hebben" if not uncontested else "favo, kom hier"
        return {"amount": target_fav, "comment": f"{rider} is een Giro-favoriet, {suffix}"}

    if len(history) == 0:
        if panic_mode and panic_filler_bid:
            return {"amount": panic_filler_bid, "comment": "geen tijd om kieskeurig te zijn"}
        return {"amount": None, "comment": "geen historie, geen feestje"}

    if len(history) == 1:
        only_points = history[0].get("points") or 0
        rookie_threshold = 50 if panic_mode else 200
        if only_points > rookie_threshold and max_spend >= TONNETJE:
            amount = min(TONNETJE if panic_mode else 2 * TONNETJE, max_spend)
            comment = "geen tijd om kieskeurig te zijn" if panic_mode else "rookie met potentie, klein gokje"
            return {"amount": amount, "comment": comment}
        if panic_mode and panic_filler_bid:
            return {"amount": panic_filler_bid, "comment": "ach, vooruit dan maar"}
        return {"amount": None, "comment": "rookie zonder cijfers, ik wacht wel"}

    recent = history[:2]
    prior = history[2:4] if len(history) >= 4 else history[1:2]

    recent_avg = _avg(recent)
    prior_avg = _avg(prior)

    _best_recent_avg = max(_best_recent_avg, recent_avg)

    if recent_avg < 100 and not panic_mode:
        return {"amount": None, "comment": "moet er nog ff inkomen, volgend jaar misschien"}

    if prior_avg <= 0:
        slope = 1.0 if recent_avg > 0 else 0.0
    else:
        slope = (recent_avg - prior_avg) / prior_avg

    if slope <= 0.05:
        if not panic_mode:
            if slope < -0.2:
                return {"amount": None, "comment": "over zijn hoogtepunt, bella ciao"}
            return {"amount": None, "comment": "blijft hangen, niks voor mij"}
        if slope < -0.3:
            return {"amount": None, "comment": "deze niet, zelfs nu niet"}
        if panic_filler_bid:
            return {"amount": panic_filler_bid, "comment": "geen tijd om kieskeurig te zijn"}
        return {"amount": None, "comment": "te duur, sla ik over"}

    threshold = max(0.0, 0.6 * (1 - relax))
    effective_best = max(_best_recent_avg, BASELINE_BEST_AVG * (1 - relax))
    if recent_avg < threshold * effective_best:
        return {
            "amount": None,
            "comment": f"doet het wel leuk maar wacht op nog wat beters (drempel {int(threshold*100)}%)"
        }

    valuation = int(recent_avg * 1500)
    if slope > 0.5:
        valuation = int(valuation * 1.3)
        slope_word = "stijgende lijn"
    elif slope > 0.2:
        slope_word = "trendje omhoog"
    else:
        slope_word = "lichte stijging"
    valuation = _round_to_tonnetje(valuation)

    if valuation < min_bid:
        return {"amount": None, "comment": "te duur voor mijn trendje"}

    target = _round_to_tonnetje(min(min_bid, max_spend))

    if target < base_bid:
        return {"amount": None, "comment": "net niet genoeg centjes"}

    contested = (highest_bid or 0) > 0
    suffix = "kom maar op" if contested else "eentje voor mij"
    comment = f"{slope_word} (+{int(slope*100)}%), {suffix}"

    return {"amount": target, "comment": comment}
