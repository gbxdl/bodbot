import { Separator } from '@radix-ui/react-separator';
import { Rabbit, Tablets, Turtle, Zap } from 'lucide-react';
import { useEffect, useReducer, useRef, useState } from 'react';
import { Toaster } from 'sonner';
import './App.css';
import AuctionInfo from './components/auction-info';
import Header from './components/header';
import Log from './components/log';
import Lot from './components/lot';
import Teams from './components/teams';
import { useTheme } from './components/theme/theme-provider';
import { Button } from './components/ui/button';
import { Spinner } from './components/ui/spinner';
import { Switch } from './components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from './components/ui/toggle-group';
import { BOTS } from './data/bots';
import { RIDER_BIBS, RIDERS } from './data/riders';
import { useWindowSize } from './lib/utils';
import type { Bid, BotResponse, PlayerKey, RiderInfo, Team } from './models/auction.models';
import { auctionReducer } from './state/auction.reducer';
import { initialState, type State } from './state/auction.state';

const STORAGE_KEY = 'bodbot-auction-state'

function initState(): State {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as State
      const teams = parsed.teams.map(t => ({ ...t, bot: BOTS[t.key] }))
      if (teams.every(t => t.bot)) {
        return { ...parsed, teams }
      }
    }
  } catch {
    // fall through
  }
  return { ...initialState }
}

function App() {
  const [state, dispatch] = useReducer(
    auctionReducer,
    null,
    initState
  );

  const { theme } = useTheme()
  const windowSize = useWindowSize();
  const [isLoadingRider, setIsLoadingRider] = useState(false)
  const [isTurboMode, setTurboMode] = useState(false)
  const [turboSpeed, setTurboSpeed] = useState("default")
  const nextRiderRef = useRef<HTMLButtonElement>(null)
  const initialStartlistLengthRef = useRef(state.startlist.length)

  useEffect(() => {
    if (state.currentLot?.status !== 'ongoing') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  }, [state])

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY)
    window.location.reload()
  }

  useEffect(() => {
    if (initialStartlistLengthRef.current > 0) return
    fetch('http://localhost:8000/startlist/tour-de-france/2026')
      .then(r => r.json())
      .then(riders => dispatch({ type: 'set-startlist', riders }))
      .catch(() => {
        dispatch({
          type: 'set-startlist',
          riders: RIDERS.map(name => ({
            name,
            bib: RIDER_BIBS[name] ?? -1,
            url: '',
            nationality: '',
            teamName: '',
            teamUrl: '',
          }))
        })
      })
  }, [])

  const TURBO_SPEEDS: { [label: string]: number } = {
    "ultra": 100,
    "fast": 300,
    "default": 1000,
    "slow": 3000
  }

  const startLot = async () => {
    setIsLoadingRider(true)
    const { rider, riderBib, riderInfo, playerOrder, players, upcomingRiders, previousRiders } = await prepareLotData(state, isTurboMode, turboSpeed)
    setIsLoadingRider(false)

    dispatch({ type: 'lot-start', rider, riderInfo, playerOrder })

    let currentBidderIndex = 0
    let currentHighestBidderIndex = null
    const bids: Bid[] = []

    while (currentHighestBidderIndex !== currentBidderIndex) {
      if (currentHighestBidderIndex === null) {
        currentHighestBidderIndex = 0
      }

      const currentBidderKey: PlayerKey = playerOrder[currentBidderIndex]
      const currentBidder = state.teams.find(team => team.key === currentBidderKey)
      const highestBid = bids.filter(bid => bid.amount !== null && bid.isValid).sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0))[0]

      if (currentBidder === undefined || currentBidder.riders.length === 8 || ((currentBidder.moneyLeft ?? 0) < (highestBid?.amount ?? 0) + 100_000)) {
        currentBidderIndex = (currentBidderIndex + 1) % state.teams.length
        continue
      }

      const bid: Bid = {
        player: currentBidderKey,
        amount: null,
        comment: null,
        isValid: true,
        isLoading: true
      }

      dispatch({ type: 'bid-pending', bid })

      try {
        let receivedBid: BotResponse | undefined = undefined

        const bidInput = {
          rider: rider,
          riderBib: riderBib,
          highestBid: highestBid?.amount ?? null,
          highestBidBy: highestBid?.player ?? null,
          bids: bids.filter(bid => bid.amount !== null).map(bid => ({
            player: bid.player,
            amount: bid.amount ?? -1,
            comment: bid.comment
          })),
          you: {
            moneyLeft: currentBidder.moneyLeft,
            riders: currentBidder.riders
          },
          others: players.filter(p => p.key !== currentBidderKey),
          upcomingRiders: upcomingRiders,
          previousRiders: previousRiders,
          riderInfo: riderInfo
        }

        receivedBid = await Promise.race([
          currentBidder?.bot.code(bidInput.rider, bidInput.riderBib, bidInput.highestBid, bidInput.highestBidBy, bidInput.bids, bidInput.you, bidInput.others, bidInput.upcomingRiders, bidInput.previousRiders, bidInput.riderInfo),
          new Promise<undefined>((resolve) => setTimeout(resolve, 5000))
        ])

        bid.amount = receivedBid?.amount ?? null
        bid.comment = receivedBid?.comment ?? null
      } catch (error) {
        bid.isValid = false
        console.error(error)
      }

      if ((bid.amount ?? 0) > currentBidder.moneyLeft ||
        ((bid.amount ?? 0) % 100_000 !== 0) ||
        (bid.amount !== null && bid.amount !== 0 && (bid.amount < (highestBid?.amount ?? 0) + 100_000))) {
        bid.isValid = false
      }

      if (bid.amount === 0) {
        bid.amount = null
      }

      if (bid.comment !== null && bid.comment?.length > 255) {
        bid.comment = bid.comment?.substring(0, 255) + "..."
      }

      if (bid.isValid && bid.amount !== null) {
        currentHighestBidderIndex = currentBidderIndex
      }

      bid.isLoading = false
      bids.push(bid)
      dispatch({ type: 'bid-received', bid })
      currentBidderIndex = (currentBidderIndex + 1) % state.teams.length

      const delay = Math.max(TURBO_SPEEDS[turboSpeed], bids.filter(b => b.amount ?? 0 > 0).length > 0 && turboSpeed === 'fast' ? TURBO_SPEEDS['default'] : -1)
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    dispatch({ type: 'lot-end' })

    if (upcomingRiders.length === 0) {
      dispatch({
        type: 'end'
      })
    } else {
      if ((bids.filter(b => b.amount ?? 0 > 0).length === 0 && isTurboMode) || (isTurboMode && turboSpeed === 'ultra')) {
        await new Promise((resolve) => setTimeout(resolve, TURBO_SPEEDS[turboSpeed]));
        nextRiderRef.current?.click()
      }
    }
  }

  const getSerializedState = (): string => {
    return JSON.stringify(state)
  }

  const setState = (state: State) => {
    dispatch({ type: 'import-state', state })
  }

  return (
    <>
      {(windowSize.height >= 640 && windowSize.width >= 640) ?
        <>
          <div className="flex flex-col h-screen overflow-hidden">
            <Header getSerializedState={getSerializedState} setState={setState} onReset={handleReset} />
            <div className="flex-none px-8 pb-6">
              <Teams teams={state.teams}></Teams>
            </div>
            <div className="flex-[1_0_0] px-8 overflow-hidden">
              {state.status === 'ongoing' && state.currentLot !== null &&
                <Lot lot={state.currentLot} />
              }
            </div>
            <Log items={state.log} />
            <div className="sticky bottom-0 bg-background shadow-md">
              <Separator className="bg-border h-px" />
              <div className="px-8 py-6">
                <div>
                  <div className="flex items-center justify-between gap-8">
                    <div>
                      <div className="flex-none flex items-center gap-12">
                        <div className="text-right min-w-[10rem]">
                          {state.status === 'ongoing' &&
                            <Button size="lg" ref={nextRiderRef} disabled={state.currentLot?.status === 'ongoing' || isLoadingRider} onClick={() => startLot()}>
                              <span className="relative">
                                <span className={isLoadingRider ? 'opacity-0' : 'opacity-100'}>Volgende fietser</span>
                                {isLoadingRider && <Spinner className="absolute inset-0 m-auto" />}
                              </span>
                            </Button>
                          }
                          {state.status === 'done' &&
                            <Button onClick={() => window.location.reload()}>
                              Even opnieuw hoor
                            </Button>
                          }
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm whitespace-nowrap">
                            Snelheid
                          </div>
                          <ToggleGroup onValueChange={setTurboSpeed} defaultValue="default" type="single" variant="outline">
                            <ToggleGroupItem value="ultra">
                              <Tablets size={16} />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="fast">
                              <Zap size={16} />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="default">
                              <Rabbit size={16} />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="slow">
                              <Turtle size={16} />
                            </ToggleGroupItem>
                          </ToggleGroup>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className={`text-sm whitespace-nowrap ${isTurboMode ? '' : 'text-muted-foreground'}`}>
                              T-t-turbo
                            </div>
                            <Switch
                              checked={isTurboMode}
                              onCheckedChange={setTurboMode}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <AuctionInfo upcomingRiders={state.upcomingRiders} previousRiders={state.previousRiders}></AuctionInfo>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Toaster
            richColors
            position="top-center"
            theme={
              theme === "dark" ? "light" :
                theme === "light" ? "dark" :
                  (window.matchMedia("(prefers-color-scheme: dark)") ? "light" : "dark")
            }
          />
        </>
        :
        <div className="h-screen w-screen flex items-center justify-center">
          <span className="p-8 text-sm text-center text-muted-foreground">
            Eh sorry je moet even een groter scherm kopen
          </span>
        </div>
      }
    </>
  )
}

export default App

async function prepareLotData(state: State, isTurboMode: boolean, turboSpeed: string): Promise<{ rider: string, riderBib: number, riderInfo: RiderInfo | null, playerOrder: PlayerKey[], players: Team[], upcomingRiders: string[], previousRiders: string[] }> {
  const randomRiderIndex = Math.floor(Math.random() * (state.upcomingRiders.length - 1))
  const rider = state.upcomingRiders[randomRiderIndex]
  const randomOrder = shufflePlayerOrder(Array(state.teams.length).fill(0).map((_, i) => i))
  const randomPlayerOrder = randomOrder.map(i => Object.values(BOTS)[i].key)

  const upcomingRiders = [...state.upcomingRiders]
  upcomingRiders.splice(randomRiderIndex, 1)

  const riderStartListEntry = state.startlist.find(r => r.name === rider)
  let riderInfo: RiderInfo | null = null

  if (riderStartListEntry !== undefined && (turboSpeed !== 'ultra' || !isTurboMode)) {
    try {
      const res = await fetch(`http://localhost:8000/${riderStartListEntry.url}`)
      if (res.ok) riderInfo = await res.json()
    } catch {
      // fail silently
    }
  }

  return {
    rider,
    riderBib: riderStartListEntry?.bib ?? -1,
    riderInfo,
    playerOrder: randomPlayerOrder,
    players: state.teams,
    upcomingRiders,
    previousRiders: state.previousRiders,
  }
}

function shufflePlayerOrder(array: number[]) {
  let currentIndex = array.length;

  while (currentIndex != 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array
}

