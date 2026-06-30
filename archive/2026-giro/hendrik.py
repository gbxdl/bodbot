from typing import TypedDict

# wordt alleen aangeroepen als:
# - je team niet vol is
# - je meer geld hebt dan het laatste hoogste bod
# - je niet het hoogste bod hebt
# komt eigenlijk gewoon neer als het nog zin heeft om een bod te doen dus ja

class TeamEntry(TypedDict):
    name: str # fietser
    amount: int # prijs
    comment: str | None # leuk berichtje

class BidEntry(TypedDict):
    player: str # naam
    amount: int # geboden bedrag
    comment: str | None # leuk berichtje

class YouState(TypedDict):
    moneyLeft: int # hoeveel geld je nog hebt (huidige bod is er niet afgehaald)
    riders: list[TeamEntry] # wie je al in je team hebt

class OtherState(TypedDict):
    key: str # iedereen die meedoet
    moneyLeft: int # hoeveel geld ze nog hebben
    riders: list[TeamEntry] # wie ze al in hun team hebben

class PointsPerSpeciality(TypedDict): # PCS punten, spreekt voor zich
    oneDayRaces: int | None
    gc: int | None
    timeTrial: int | None
    sprint: int | None
    climber: int | None
    hills: int | None

class PointsPerSeason(TypedDict): # punten per seizoen
    season: int # jaartal
    points: int # aantal punten
    rank: int # ranking van dat jaar

class RiderInfo(TypedDict): # wat info van PCS, maar misschien ook niet
    name: str | None # naam
    nationality: str | None # land code (twee letters)
    birthdate: str | None # gewoon lekker in een string: YYYY-MM-DD
    placeOfBirth: str | None # mooie plek
    currentTeam: str | None # lekker voor het teamgevoel
    height: float | None # lengte in meter
    weight: float | None # zwaarte in kilogram
    imageUrl: str | None # leuk kiekje
    pointsPerSpeciality: PointsPerSpeciality | None
    pointsPerSeasonHistory: list[PointsPerSeason] | None # aflopend, dit jaar eerst

class BotResponse(TypedDict):
    amount: int | None # hoeveel je wil bieden, moet deelbaar zijn door een ton
    comment: str # leuk berichtje doe iedereen de groeten

def bot(
    rider: str, # naam zoals op https://www.procyclingstats.com/race/giro-d-italia/2026/startlist/alphabetical
    rider_bib: int, # nummer zoals op https://www.procyclingstats.com/race/giro-d-italia/2026/startlist/alphabetical (-1 als het niet bekend is)
    highest_bid: int | None, # hoogste bod, is nooit van jou
    highest_bid_by: str | None, # hoogste bod persoon
    bids: list[BidEntry], # alle boden (in oplopende volgorde), inclusief die van jou
    you: YouState,
    others: list[OtherState], # de rest, jij komt hier niet voor
    upcoming_riders: list[str], # wie er nog komen in alfabetische volgorde (exclusief huidige)
    previous_riders: list[str], # wie er al zijn geweest in alfabetische volgorde (exclusief huidige)
    rider_info: RiderInfo | None, # wat info van PCS, maar misschien ook niet
) -> BotResponse:
    STEP = 100_000
    MAX_RIDERS = 8
    UNIBET_TEAM = "Unibet Rose Rockets"
    UNIBET_CAP = 3
    ELITE_RANK_THRESHOLD = 5
    GEM_RANK_THRESHOLD = 30
    GOOD_RANK_THRESHOLD = 50
    DECENT_RANK_THRESHOLD = 75
    ELITE_MAX_SPEND = 6_000_000
    GEM_MAX_SPEND = 4_000_000
    SIGNAL_MAX_SPEND = 3_000_000
    GEM_OWNED_THRESHOLD = 2_500_000

    team = you["riders"]
    slots_used = len(team)
    slots_left = MAX_RIDERS - slots_used
    money_left = you["moneyLeft"]
    base = highest_bid or 0
    next_bid = base + STEP

    comment = f"Yes! {rider} precies die ik wil hebben"

    if slots_left == 1:
        amount = (money_left // STEP) * STEP
        if amount < next_bid:
            return {"amount": None, "comment": "Wie is deze bro!?"}
        return {"amount": amount, "comment": comment}

    if next_bid > money_left:
        return {"amount": None, "comment": "Wie is deze bro!?"}

    parts = [p for p in rider.strip().split() if p]
    words_lower = {p.lower() for p in parts}
    has_van = "van" in words_lower
    has_de = "de" in words_lower
    name_lower = rider.lower()
    has_ben = "ben" in name_lower
    has_swift = "swift" in name_lower
    has_strong = "strong" in name_lower
    is_alliteration = len(parts) >= 2 and parts[0][:1].lower() == parts[-1][:1].lower()
    is_unibet = bool(rider_info and rider_info.get("currentTeam") == UNIBET_TEAM)
    has_name_signal = has_van or has_de or has_ben or has_swift or has_strong

    history = (rider_info or {}).get("pointsPerSeasonHistory") or []
    last_rank = history[0].get("rank") if history else None
    is_elite = last_rank is not None and last_rank <= ELITE_RANK_THRESHOLD
    is_gem = last_rank is not None and last_rank <= GEM_RANK_THRESHOLD
    is_good_score = last_rank is not None and last_rank <= GOOD_RANK_THRESHOLD
    is_decent_score = last_rank is not None and last_rank <= DECENT_RANK_THRESHOLD

    own_gem = any(r["amount"] >= GEM_OWNED_THRESHOLD for r in team)

    unibet_active = is_unibet and slots_used < UNIBET_CAP

    qualifies = is_elite or is_gem or unibet_active or is_alliteration or has_name_signal
    if not qualifies:
        return {"amount": None, "comment": "Wie is deze bro!?"}

    fair_share = (money_left // max(slots_left, 1) // STEP) * STEP
    candidates = [fair_share]

    if is_elite:
        candidates.append(min(ELITE_MAX_SPEND, money_left) if not own_gem else int(fair_share * 4))
    elif is_gem:
        candidates.append(min(GEM_MAX_SPEND, money_left) if not own_gem else int(fair_share * 2.5))

    score_boost = 1.0
    if is_good_score:
        score_boost = 1.6
    elif is_decent_score:
        score_boost = 1.3

    if unibet_active:
        raw = int(fair_share * 2.5 * score_boost)
        candidates.append(min(raw, SIGNAL_MAX_SPEND))
    if has_name_signal:
        raw = int(fair_share * 2.0 * score_boost)
        candidates.append(min(raw, SIGNAL_MAX_SPEND))
    if is_alliteration:
        raw = int(fair_share * 1.4 * score_boost)
        candidates.append(min(raw, SIGNAL_MAX_SPEND))

    willingness = min((max(candidates) // STEP) * STEP, money_left)

    if highest_bid is None:
        return {"amount": STEP, "comment": comment}

    if next_bid <= willingness:
        return {"amount": next_bid, "comment": comment}

    return {"amount": None, "comment": "Wie is deze bro!?"}
