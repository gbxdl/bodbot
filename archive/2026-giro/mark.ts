/* eslint-disable @typescript-eslint/no-unused-vars */

import { BOTS } from "@/data/bots"
import type { PlayerKey } from "@/models/auction.models"

const SESSION_STORAGE_KEY = 'MARKS_ZIEKE_BOT_OPSLAG'

export default function bot(
  rider: string,
  riderBib: number,
  highestBid: number | null,
  highestBidBy: PlayerKey | null,
  bids: {
    player: PlayerKey | null,
    amount: number,
    comment: string | null,
  }[],
  you: {
    moneyLeft: number,
    riders: {
      name: string,
      amount: number,
      comment: string | null
    }[],
  },
  others: {
    key: PlayerKey,
    moneyLeft: number,
    riders: {
      name: string,
      amount: number,
      comment: string | null
    }[],
  }[],
  upcomingRiders: string[],
  previousRiders: string[]
): {
  amount: number | null,
  comment: string | null
} {

  const hetIsInGodsHanden = () => {
    const doBid = Math.random() < 0.5

    return {
      amount: doBid ? Math.min(you.moneyLeft, (highestBid ?? 0) + 100000) : null,
      comment: "het is allemaal mis gegaan"
    }
  }

  const ME_FAV = 'VINGEGAARD Jonas'
  const ME_ANDERE_FAV = 'tom'

  const ditIsMeFav = rider === ME_FAV
  const ikHebMeFav = you.riders.some(r => r.name === ME_FAV)
  const meFavKomtNog = upcomingRiders.indexOf(ME_FAV) !== -1

  const numberOfBoughtRiders = you.riders.length
  const maxPossibleBid = you.moneyLeft - ((8 - numberOfBoughtRiders - 1) * 100_000)

  // Blinde paniek
  if (!ditIsMeFav && !ikHebMeFav && !meFavKomtNog) {
    return hetIsInGodsHanden()
  }

  // Paniek
  if (upcomingRiders.length < (8 - numberOfBoughtRiders)) {
    if ((highestBid ?? 0) + 100_000 <= maxPossibleBid) {
      return {
        amount: (highestBid ?? 0) + 100_000,
        comment: "deze dan maar"
      }
    }
  }

  // Dit is me fav
  if (ditIsMeFav) {
    return {
      amount: you.riders.length === 7 ? you.moneyLeft : (highestBid ?? 0) + 100_000,
      comment: "dit is me fav"
    }
  }

  // Rustaaagh
  if (meFavKomtNog && you.riders.length === 7) {
    return {
      amount: null,
      comment: "me fav komt nog"
    }
  }

  // Even kijken wat de rest doet hoor
  const maxBid = meFavKomtNog ? Math.max(0, you.moneyLeft - (Math.max(...others.map(o => o.moneyLeft)) + 100_000)) : maxPossibleBid

  if (meFavKomtNog && (maxBid <= 0 || (maxBid < (highestBid ?? 0) + 100_000))) {
    return {
      amount: null,
      comment: "me fav komt nog"
    }
  }

  const tomHadKunnenBieden = others.find(o => o.key === ME_ANDERE_FAV && o.moneyLeft > 0 && o.riders.length < 8)
  const tomHeeftEenBodGedaan = bids.some(b => b.player === ME_ANDERE_FAV)
  const otherPlayersWithBids = [...new Set(bids.map(b => b.player).filter(k => k !== 'mark'))].length
  const othersWhoCanBid = others.filter(o => o.riders.length < 8 && o.moneyLeft > 0).length
  const theStrengsOfThePackIsTehWolf = otherPlayersWithBids >= Math.ceil(othersWhoCanBid / 2)

  if (tomHeeftEenBodGedaan || (!tomHadKunnenBieden && theStrengsOfThePackIsTehWolf)) {
    return {
      amount: (highestBid ?? 0) + 100_000,
      comment: `ik vertrouw op tom en anders op de rest`
    }
  } else {
    return {
      amount: null,
      comment: `voelt niet goed`
    }
  }
}