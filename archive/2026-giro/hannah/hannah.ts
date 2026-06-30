import type { PlayerKey } from "@/models/auction.models";
import {
  ALL_RIDERS,
  BUDGET_RIDERS,
  TOP_RIDERS,
  TOP_TOP_RIDERS,
  type Rider,
} from "./riders";

type PanicLevel = "low" | "medium" | "high" | "extreme" | "buybuybuy";

// const panicLevelMultipliers = {'low' : 1, "medium" : 1.2, "high" : 1.5, "extreme"}

function getPanicLevel(
  currentRiders: {
    // wie je al in je team hebt
    name: string; // fietser
    amount: number; // prijs
    comment: string | null; // leuk berichtje
  }[],
  upcomingRiders: string[],
): PanicLevel {
  if (upcomingRiders.length < 8 - currentRiders.length) {
    return "buybuybuy";
  }
  const topRidersLeft = TOP_RIDERS.filter((topRider) =>
    upcomingRiders.some((upcomingRider) => upcomingRider === topRider.name),
  );
  const budgetRidersLeft = BUDGET_RIDERS.filter((budgetRider) =>
    upcomingRiders.some((upcomingRider) => upcomingRider === budgetRider.name),
  );
  const topTopRidersLeft = topRidersLeft.filter((topRider) =>
    TOP_TOP_RIDERS.some((topTopRider) => topTopRider.name === topRider.name),
  );
  if (topRidersLeft.length === 0) {
    return "extreme";
  }
  if (topRidersLeft.length <= 5 && currentRiders.length <= 8) {
    return "high";
  }
  if (topRidersLeft.length <= 12) {
    return "medium";
  } else {
    return "low";
  }
}

function getBid(
  rider: string,
  moneyLeft: number,
  panicLevel: PanicLevel,
  highestBid: number,
): number | null {
  const nextBid = highestBid + 100000;
  const maxBid = getMaxBid(rider);
  if (isTopTopRider(rider)) {
    return nextBid > moneyLeft || nextBid > maxBid ? null : nextBid;
  }
  if (panicLevel === "low") {
    return null;
  }
  if (panicLevel === "medium" && isBudgetRider(rider)) {
    return null;
  }
  if (panicLevel === "buybuybuy") {
    return highestBid + 100000;
  }
  if (panicLevel === "extreme" && isBudgetRider(rider)) {
    const possBid = getDesirabilityScore(rider) * 100000;
    return nextBid > moneyLeft || nextBid > possBid ? null : nextBid;
  }
  if (
    panicLevel === "high" &&
    isBudgetRider(rider) &&
    getDesirabilityScore(rider) > 30
  ) {
    const possBid = getDesirabilityScore(rider) * 100000;
    return nextBid > moneyLeft || nextBid > possBid ? null : nextBid;
  }
  return nextBid > moneyLeft || nextBid > maxBid ? null : nextBid;
}

function getDesirabilityScore(riderName: string): number {
  return (
    ALL_RIDERS.find((rider: Rider) => rider.name === riderName)
      ?.desirabilityScore ?? 0
  );
}

function getMaxBid(riderName: string): number {
  if (isBudgetRider(riderName)) {
    return 500000;
  } else {
    return (
      ALL_RIDERS.find((rider: Rider) => rider.name === riderName)?.maxBid ?? 0
    );
  }
}

function isBudgetRider(riderName: string) {
  return BUDGET_RIDERS.some(
    (upcomingRider) => upcomingRider.name === riderName,
  );
}

function isTopTopRider(riderName: string) {
  return TOP_TOP_RIDERS.some((rider) => rider.name === riderName);
}

export default function bot(
  rider: string, // naam zoals op https://www.procyclingstats.com/race/vuelta-a-espana/2025/startlist/alphabetical
  riderBib: number, // nummer zoals op https://www.procyclingstats.com/race/vuelta-a-espana/2025/startlist/alphabetical (-1 als het niet bekend is)
  highestBid: number | null, // hoogste bod, is nooit van jou
  highestBidBy: PlayerKey | null, // hoogste bod persoon
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
): {
  amount: number | null; // hoeveel je wil bieden, moet deelbaar zijn door een ton
  comment: string | null; // leuk berichtje doe iedereen de groeten
} {
  const panicLevel = getPanicLevel(you.riders, upcomingRiders);
  const bid = getBid(rider, you.moneyLeft, panicLevel, highestBid ?? 0);
  const comment =
    bid && bid > 0
      ? `fuck jou ${highestBidBy}`
      : rider === "VINGEGAARD Jonas"
        ? "Ik neuk jullie allemaal de moeder"
        : "deze troep hoef ik niet";
  return { amount: bid, comment: comment };
}

//   rider: string,
//   moneyLeft: number,
//   panicLevel: PanicLevel,
//   highestBid: number