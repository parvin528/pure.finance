import { useWeb3React } from '@web3-react/core'
import Big from 'big.js'
import { useContext, useEffect, useState } from 'react'
import useSWR from 'swr'
import PaymentStreamsLibContext from '../components/payment-streams/paymentStreamsLib'

const ETH_BLOCK_TIME = 13 // Average block time in Ethereum

export const useStreams = function () {
  const { active, account } = useWeb3React()
  const [secondsPast, setSecondsPast] = useState(0)
  const [futureStreamValues, setFutureStreamValues] = useState({
    incoming: [],
    outgoing: []
  })
  const paymentStreamsLib = useContext(PaymentStreamsLibContext)
  const getStreams = address => paymentStreamsLib.getStreams(address)

  const { data, error, mutate } = useSWR(
    active ? `${account}-streams` : null,
    () => getStreams(account),
    {
      refreshInterval: ETH_BLOCK_TIME * 1000,
      onSuccess: () => setSecondsPast(0)
    }
  )

  const isLoading = data === undefined && error === undefined

  useEffect(
    function () {
      if (isLoading || !!error) {
        return undefined
      }
      const timeoutId = setTimeout(() => {
        const newIncoming = data.incoming.map(
          ({ claimable, usdPerSec, ...stream }) => ({
            usdPerSec,
            ...stream,
            claimable: Big(claimable).plus(Big(usdPerSec).times(secondsPast))
          })
        )
        const newOutgoing = data.outgoing.map(
          ({ claimable, usdPerSec, ...stream }) => ({
            usdPerSec,
            ...stream,
            claimable: Big(claimable).plus(Big(usdPerSec).times(secondsPast))
          })
        )
        setFutureStreamValues({ incoming: newIncoming, outgoing: newOutgoing })
        setSecondsPast(prevSeconds => prevSeconds + 1)
      }, 1000)
      return () => clearTimeout(timeoutId)
    },
    [isLoading, error, data, secondsPast, setSecondsPast, setFutureStreamValues]
  )

  return {
    streams: data,
    futureStreamValues,
    mutate,
    error,
    isLoading
  }
}
