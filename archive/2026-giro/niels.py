import requests

ENDPOINT = 'https://girobotvanniels.koenen-bolt.nl/bid'

def bot(rider, rider_bib, highest_bid, highest_bid_by, bids, you, others, upcoming_riders, previous_riders, rider_info):
    response = requests.post(ENDPOINT, json={
        'rider': rider,
        'riderBib': rider_bib,
        'highestBid': highest_bid,
        'highestBidBy': highest_bid_by,
        'bids': bids,
        'you': you,
        'others': others,
        'upcomingRiders': upcoming_riders,
        'previousRiders': previous_riders,
        'riderInfo': rider_info,
    }, timeout=5)
    return response.json()
