import random
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
    pointsPerSeasonHistory: list[PointsPerSeason] | None

class BotResponse(TypedDict):
    amount: int | None # hoeveel je wil bieden, moet deelbaar zijn door een ton
    comment: str # leuk berichtje doe iedereen de groeten

def get_topper_factor(r2025):
    if 1 <= r2025 <= 5:
        return 1
    elif 5 < r2025 <= 10:
        return 0.5
    elif 10 < r2025 <= 25:
        return 0.4
    elif 25 < r2025 <= 50:
        return 0.3
    elif 50 < r2025 <= 100:
        return 0.1
    else:
        return 0

def get_inshape_factor(r2026):
    if 1 <= r2026 <= 5:
        return 1
    elif 5 < r2026 <= 10:
        return 0.5
    elif 10 < r2026 <= 25:
        return 0.4
    elif 25 < r2026 <= 50:
        return 0.3
    elif 50 < r2026 <= 150:
        return 0.1
    else:
        return 0

def get_rider_value(rank2025, rank2026):
    topperfactor = get_topper_factor(rank2025)
    vormfactor = get_inshape_factor(rank2026)

    return topperfactor * vormfactor

def get_oempa_factor(renners):

    hoeveel = len(renners)

    if hoeveel > 0:
        totaalbedrag = sum(x['amount'] for x in renners)
        oempa = totaalbedrag / hoeveel
    else:
        oempa = 500_000

    return oempa

def bot(
    rider: str, # naam zoals op procyclingstats
    rider_bib: int, # rugnummer (-1 als niet bekend)
    highest_bid: int | None, # hoogste bod, is nooit van jou
    highest_bid_by: str | None, # hoogste bod persoon
    bids: list[BidEntry], # alle boden (in oplopende volgorde), inclusief die van jou
    you: YouState, # jouw staat
    others: list[OtherState], # de rest, jij komt hier niet voor
    upcoming_riders: list[str], # wie er nog komen in alfabetische volgorde (exclusief huidige)
    previous_riders: list[str], # wie er al zijn geweest in alfabetische volgorde (exclusief huidige)
    rider_info: RiderInfo | None, # wat info van PCS, maar misschien ook niet
) -> BotResponse:
    
    # Set some parameters
    bidlimit = 6_500_000
    minbid = 100_000
    totalteamsize = 10
    min_oempa = 500_000

    # Get some team info
    teamsize = len(you['riders'])
    spaceleft = totalteamsize - teamsize
    oempaloempafactor = get_oempa_factor(you['riders'])

    # Fetch some rider info
    rank2025 = rider_info["pointsPerSeasonHistory"][0]['rank']
    rank2026 = rider_info["pointsPerSeasonHistory"][1]['rank']
   
    # Rider value bepalen en dus max bod
    base = (highest_bid or 0)
    riderValueFactor = get_rider_value(rank2025, rank2026)
    moneyreserve = minbid * (spaceleft - 1)
    if spaceleft > 1:
        max_bid = min(you['moneyLeft'] * riderValueFactor - moneyreserve, bidlimit)
    else:
        max_bid = you['moneyLeft'] * riderValueFactor

    # wel/niet bieden
    if max_bid > base and (oempaloempafactor >= min_oempa or rank2026 <= 50):
        amount = base + minbid
        msg = "deze wil ik! afblijven"
    else:
        amount = None
        msg = "bagger. hoef ik niet"

    return {
        "amount": amount,
        "comment": msg,
    }
