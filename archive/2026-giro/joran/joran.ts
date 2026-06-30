/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PlayerKey } from "@/models/auction.models"
import { rankingList } from "./ranking"

const AANTAL_RENNERS_PER_TEAM = 8
const TONNETJE = 100_000

export default function bot(
  rider: string, // naam zoals op https://www.procyclingstats.com/race/giro-d-italia/2026/startlist/alphabetical
  riderBib: number, // nummer zoals op https://www.procyclingstats.com/race/giro-d-italia/2026/startlist/alphabetical (-1 als het niet bekend is)
  highestBid: number | null, // hoogste bod, is nooit van jou
  highestBidBy: PlayerKey | null, // hoogste bod persoon
  bids: {
    // alle boden (in oplopende volgorde), inclusief die van jou
    player: PlayerKey // naam
    amount: number // geboden bedrag
    comment: string | null // leuk berichtje
  }[],
  you: {
    moneyLeft: number // hoeveel geld je nog hebt (huidige bod is er niet afgehaald)
    riders: {
      // wie je al in je team hebt
      name: string // fietser
      amount: number // prijs
      comment: string | null // leuk berichtje
    }[]
  },
  others: {
    // de rest, jij komt hier niet voor
    key: PlayerKey // iedereen die meedoet
    moneyLeft: number // hoeveel geld ze nog hebben
    riders: {
      // wie ze al in hun team hebben
      name: string // fietser
      amount: number // prijs
      comment: string | null // leuk berichtje
    }[]
  }[],
  upcomingRiders: string[], // wie er nog komen in alfabetische volgorde (exclusief huidige)
  previousRiders: string[], // wie er al zijn geweest in alfabetische volgorde (exclusief huidige)
  riderInfo: {
    // wat info van PCS, maar misschien ook niet
    name: string // naam
    nationality: string // land code (twee letters)
    birthdate: string // gewoon lekker in een string: YYYY-MM-DD
    placeOfBirth: string | null // mooie plek
    currentTeam: string | null // lekker voor het teamgevoel
    height: number | null // lengte in meter
    weight: number | null // zwaarte in kilogram
    imageUrl: string | null // leuk kiekje
    pointsPerSpeciality: {
      // PCS punten, spreekt voor zich
      oneDayRaces: number
      gc: number
      timeTrial: number
      sprint: number
      climber: number
      hills: number
    }
    pointsPerSeasonHistory: {
      // punten per seizoen, aflopend
      season: number // jaartal
      points: number // aantal punten
      rank: number // ranking van dat jaar
    }[]
  } | null
): {
  amount: number | null
  comment: string | null
} {
  const rennerIndex = rankingList
    .filter((naam) => !previousRiders.includes(naam))
    .indexOf(rider)

  if (rennerIndex === -1) {
    return {
      amount: null,
      comment: "deze is zeker net nieuw of niet???!?!?!",
    }
  }

  const rankingVanDezeRennerVanIedereenDieNogMoetKomen = rennerIndex + 1

  const aantalPlekkenOverInAlleTeams =
    others
      .filter((other) => other.moneyLeft !== 0)
      .map((other) => other.riders)
      .reduce((aantalPlekkenBijAnderen, team) => {
        return aantalPlekkenBijAnderen + (AANTAL_RENNERS_PER_TEAM - team.length)
      }, 0) +
    (AANTAL_RENNERS_PER_TEAM - you.riders.length)

  if (
    rankingVanDezeRennerVanIedereenDieNogMoetKomen >
    aantalPlekkenOverInAlleTeams
  ) {
    return {
      amount: null,
      comment: "tief op met deze nono",
    }
  }
  const plekkenOver = AANTAL_RENNERS_PER_TEAM - you.riders.length

  // Als ik nog x plekken heb en deze renner heeft ranking <= x, dan altijd bieden.
  if (plekkenOver >= rankingVanDezeRennerVanIedereenDieNogMoetKomen) {
    if (highestBid === null) {
      return {
        amount: TONNETJE,
        comment: "TONNETJE",
      }
    }

    return {
      amount: highestBid + TONNETJE,
      comment: "nou vooruit",
    }
  }

  // Even zeker maken dat we niet alleen maar tonnetjes kopen
  if (highestBid === null) {
    const gemiddeldBodOver = you.moneyLeft / plekkenOver

    // Alleen tonnetjes bieden als we niet zoveel geld meer hebben
    if (gemiddeldBodOver < 1_200_000) {
      return {
        amount: TONNETJE,
        comment: "GEK TONNETJE",
      }
    }

    return {
      amount: null,
      comment: "leuke renner, maar nu even niet",
    }
  }

  if (
    isTooExpensive(
      highestBid,
      rankingVanDezeRennerVanIedereenDieNogMoetKomen,
      you
    )
  ) {
    return {
      amount: null,
      comment: "zijn jullie helemaal koekwaus geworden",
    }
  }

  return {
    amount: highestBid + TONNETJE,
    comment: "ok doe maar",
  }
}

function isTooExpensive(
  highestBid: number,
  rankingVanIedereenDieNogMoetKomen: number,
  you: {
    moneyLeft: number
    riders: {
      name: string
      amount: number
      comment: string | null
    }[]
  }
): boolean {
  const plekkenOver = AANTAL_RENNERS_PER_TEAM - you.riders.length
  const volgendeBod = highestBid ? highestBid + TONNETJE : TONNETJE
  const geldOverNaHogerBod = you.moneyLeft - volgendeBod

  // Hebben we nog genoeg geld voor een heel team?
  if (geldOverNaHogerBod / plekkenOver < TONNETJE) {
    return true
  }

  // Is ie erg duur voor een niet-toppert?
  if (
    rankingVanIedereenDieNogMoetKomen > AANTAL_RENNERS_PER_TEAM &&
    highestBid &&
    highestBid > 3_000_000
  ) {
    return true
  }

  return false
}
