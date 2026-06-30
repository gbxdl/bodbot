from fastapi import APIRouter
from typing import Optional
from pydantic import BaseModel
from ..dummies.wout import bot as wout_bot

# Ok nu echt
# from ..eddyMerckx import bot as eddy_bot
# from ..lucas import bot as lucas_bot
# from ..hendrik import bot as hendrik_bot
# from ..tom import bot as tom_bot
# from ..niels import bot as niels_bot


class BidEntry(BaseModel):
    player: str
    amount: int
    comment: Optional[str]

class TeamEntry(BaseModel):
    name: str
    amount: int
    comment: Optional[str]

class YouState(BaseModel):
    moneyLeft: int
    riders: list[TeamEntry]

class OtherState(BaseModel):
    key: str
    moneyLeft: int
    riders: list[TeamEntry]

class PointsPerSpeciality(BaseModel):
    oneDayRaces: Optional[int]
    gc: Optional[int]
    timeTrial: Optional[int]
    sprint: Optional[int]
    climber: Optional[int]
    hills: Optional[int]

class PointsPerSeason(BaseModel):
    season: int
    points: int
    rank: int

class RiderInfo(BaseModel):
    name: Optional[str]
    nationality: Optional[str]
    birthdate: Optional[str]
    placeOfBirth: Optional[str]
    currentTeam: Optional[str]
    height: Optional[float]
    weight: Optional[float]
    imageUrl: Optional[str]
    pointsPerSpeciality: Optional[PointsPerSpeciality]
    pointsPerSeasonHistory: Optional[list[PointsPerSeason]]

class BotRequest(BaseModel):
    rider: str
    riderBib: int
    highestBid: Optional[int]
    highestBidBy: Optional[str]
    bids: list[BidEntry]
    you: YouState
    others: list[OtherState]
    upcomingRiders: list[str]
    previousRiders: list[str]
    riderInfo: Optional[RiderInfo]

router = APIRouter(prefix="/bot")

@router.post("/wout")
def call_wout(req: BotRequest):
    return wout_bot(
        rider=req.rider,
        rider_bib=req.riderBib,
        highest_bid=req.highestBid,
        highest_bid_by=req.highestBidBy,
        bids=[b.model_dump() for b in req.bids],
        you=req.you.model_dump(),
        others=[o.model_dump() for o in req.others],
        upcoming_riders=req.upcomingRiders,
        previous_riders=req.previousRiders,
        rider_info=req.riderInfo.model_dump() if req.riderInfo else None,
    )

# @router.post("/eddyMerckx")
# def call_eddy(req: BotRequest):
#     return eddy_bot(
#         rider=req.rider,
#         rider_bib=req.riderBib,
#         highest_bid=req.highestBid,
#         highest_bid_by=req.highestBidBy,
#         bids=[b.model_dump() for b in req.bids],
#         you=req.you.model_dump(),
#         others=[o.model_dump() for o in req.others],
#         upcoming_riders=req.upcomingRiders,
#         previous_riders=req.previousRiders,
#         rider_info=req.riderInfo.model_dump() if req.riderInfo else None,
#     )

# @router.post("/lucas")
# def call_lucas(req: BotRequest):
#     return lucas_bot(
#       rider=req.rider,
#         rider_bib=req.riderBib,
#         highest_bid=req.highestBid,
#         highest_bid_by=req.highestBidBy,
#         bids=[b.model_dump() for b in req.bids],
#         you=req.you.model_dump(),
#         others=[o.model_dump() for o in req.others],
#         upcoming_riders=req.upcomingRiders,
#         previous_riders=req.previousRiders,
#         rider_info=req.riderInfo.model_dump() if req.riderInfo else None,
#     )

# @router.post("/hendrik")
# def call_wout(req: BotRequest):
#     return hendrik_bot(
#         rider=req.rider,
#         rider_bib=req.riderBib,
#         highest_bid=req.highestBid,
#         highest_bid_by=req.highestBidBy,
#         bids=[b.model_dump() for b in req.bids],
#         you=req.you.model_dump(),
#         others=[o.model_dump() for o in req.others],
#         upcoming_riders=req.upcomingRiders,
#         previous_riders=req.previousRiders,
#         rider_info=req.riderInfo.model_dump() if req.riderInfo else None,
#     )

# @router.post("/tom")
# def call_wout(req: BotRequest):
#     return tom_bot(
#         rider=req.rider,
#         rider_bib=req.riderBib,
#         highest_bid=req.highestBid,
#         highest_bid_by=req.highestBidBy,
#         bids=[b.model_dump() for b in req.bids],
#         you=req.you.model_dump(),
#         others=[o.model_dump() for o in req.others],
#         upcoming_riders=req.upcomingRiders,
#         previous_riders=req.previousRiders,
#         rider_info=req.riderInfo.model_dump() if req.riderInfo else None,
#     )

# @router.post("/niels")
# def call_niels(req: BotRequest):
#     return niels_bot(
#         rider=req.rider,
#         rider_bib=req.riderBib,
#         highest_bid=req.highestBid,
#         highest_bid_by=req.highestBidBy,
#         bids=[b.model_dump() for b in req.bids],
#         you=req.you.model_dump(),
#         others=[o.model_dump() for o in req.others],
#         upcoming_riders=req.upcomingRiders,
#         previous_riders=req.previousRiders,
#         rider_info=req.riderInfo.model_dump() if req.riderInfo else None,
#     )
