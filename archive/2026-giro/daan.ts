/* eslint-disable @typescript-eslint/no-unused-vars */

import type { PlayerKey } from "@/models/auction.models";

// wordt alleen aangeroepen als:
// - je team niet vol is
// - je meer geld hebt dan het laatste hoogste bod
// - je niet het hoogste bod hebt
// komt eigenlijk gewoon neer als het nog zin heeft om een bod te doen dus ja

export default function bot(
  rider: string, // naam zoals op https://www.procyclingstats.com/race/vuelta-a-espana/2025/startlist/alphabetical
  riderBib: number, // nummer zoals op https://www.procyclingstats.com/race/vuelta-a-espana/2025/startlist/alphabetical (-1 als het niet bekend is)
  highestBid: number | null, // hoogste bod, is nooit van jou
  highestBidBy: PlayerKey | null,
  bids: {
    // alle boden (in oplopende volgorde), inclusief die van jou
    player: PlayerKey; // naam
    amount: number; // geboden bedrag
    comment: string | null; // leuk berichtje
  }[],
  you: {
    moneyLeft: number; // hoeveel geld je nog hebt (huidige bod is er niet afgehaald)
    riders: {
      // wie je al in je team hebt
      name: string; // fietser
      amount: number; // prijs
      comment: string | null; // leuk berichtje
    }[];
  },
  others: {
    // de rest, jij komt hier niet voor
    key: PlayerKey; // iedereen die meedoet
    moneyLeft: number; // hoeveel geld ze nog hebben
    riders: {
      // wie ze al in hun team hebben
      name: string; // fietser
      amount: number; // prijs
      comment: string | null; // leuk berichtje
    }[];
  }[],
  upcomingRiders: string[], // wie er nog komen in alfabetische volgorde (exclusief huidige)
  previousRiders: string[], // wie er al zijn geweest in alfabetische volgorde (exclusief huidige)
  riderInfo: {
    // wat info van PCS, maar misschien ook niet
    name: string; // naam
    nationality: string; // land code (twee letters)
    birthdate: string; // gewoon lekker in een string: YYYY-MM-DD
    placeOfBirth: string | null; // mooie plek
    currentTeam: string | null; // lekker voor het teamgevoel
    height: number | null; // lengte in meter
    weight: number | null; // zwaarte in kilogram
    imageUrl: string | null; // leuk kiekje
    pointsPerSpeciality: {
      // PCS punten, spreekt voor zich
      oneDayRaces: number;
      gc: number;
      timeTrial: number;
      sprint: number;
      climber: number;
      hills: number;
    };
    pointsPerSeasonHistory: {
      // punten per seizoen
      season: number; // jaartal
      points: number; // aantal punten
      rank: number; // ranking van dat jaar
    }[];
  } | null,
): Promise<{
  comment: string | null; // leuk berichtje doe iedereen de groeten
  amount: number | null; // hoeveel je wil bieden, moet deelbaar zijn door een ton
}> {
  return fetch("http://localhost:8000/bot/eddyMerckx", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rider,
      riderBib,
      highestBid,
      highestBidBy,
      bids,
      you,
      others,
      upcomingRiders,
      previousRiders,
      riderInfo,
    }),
  }).then((r) => r.json());
}
