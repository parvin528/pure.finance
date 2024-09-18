import { useWeb3React } from '@web3-react/core'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import shortAccount from '../utils/account'
import { injected, walletlink } from '../utils/connectors'

import Dropdown from './Dropdown'
import SvgContainer from './svg/SvgContainer'
import WalletConnectionErrorHandler from './WalletConnectionErrorHandler'
import WalletConnectionModal from './WalletConnectionModal'
const persistLastConnectorKey = 'lastConnector'

const persistLastConnector = connectorName =>
  window.localStorage.setItem(persistLastConnectorKey, connectorName)
const getLastConnector = () =>
  window.localStorage.getItem(persistLastConnectorKey)
const removeLastConnector = () =>
  window.localStorage.removeItem(persistLastConnectorKey)

const Wallet = function () {
  const { account, active, activate, connector, deactivate, error, setError } =
    useWeb3React()
  const t = useTranslations()
  const shortenedAccount = shortAccount(account)

  const [activatingConnector, setActivatingConnector] = useState()
  const [showWalletConnector, setShowWalletConnector] = useState(false)
  const [errorModalOpen, setErrorModalOpen] = useState(false)

  useEffect(
    function () {
      if (activatingConnector && activatingConnector === connector) {
        setActivatingConnector(undefined)
      }
    },
    [activatingConnector, connector]
  )

  useEffect(
    function () {
      setErrorModalOpen(true)
      if (error) removeLastConnector()
    },
    [error]
  )

  const [tried, setTried] = useState(false)

  useEffect(
    function () {
      const lastConnector = getLastConnector()
      if (lastConnector === 'injected') {
        injected
          .isAuthorized()
          .then(function (isAuthorized) {
            if (isAuthorized) {
              activate(injected, setError)
            }
          })
          .catch(function () {
            setTried(true)
          })
      } else if (lastConnector === 'walletlink') {
        activate(walletlink, setError)
      }
    },
    [activate, setError]
  )

  useEffect(
    function () {
      if (!tried && active) {
        setTried(true)
      }
    },
    [tried, active]
  )

  useEffect(
    function () {
      const { ethereum } = window
      if (ethereum && ethereum.on && !active && !error) {
        const handleChainChanged = function () {
          activate(injected)
        }

        ethereum.on('chainChanged', handleChainChanged)

        return function () {
          if (ethereum.removeListener) {
            ethereum.removeListener('chainChanged', handleChainChanged)
          }
        }
      }
      return undefined
    },
    [activate, active, error]
  )

  const wallets = [
    {
      connector: injected,
      handleConnection() {
        setActivatingConnector(injected)
        activate(injected, setError)
        persistLastConnector('injected')
        setShowWalletConnector(false)
      },
      handleDisconnection() {
        deactivate()
        removeLastConnector()
      },
      name: 'Metamask'
    },
    {
      connector: walletlink,
      handleConnection() {
        setActivatingConnector(walletlink)
        activate(walletlink, setError)
        persistLastConnector('walletlink')
        setShowWalletConnector(false)
      },
      handleDisconnection() {
        connector.close()
        removeLastConnector()
      },
      name: 'Coinbase Wallet'
    }
  ]

  const deactivateConnector = function () {
    wallets.find(w => w.connector === connector).handleDisconnection()
  }

  return (
    <>
      <WalletConnectionModal
        modalIsOpen={showWalletConnector}
        onRequestClose={() => setShowWalletConnector(false)}
        wallets={wallets}
      />
      <WalletConnectionErrorHandler
        error={error}
        modalIsOpen={errorModalOpen}
        onRequestClose={() => setErrorModalOpen(false)}
      />
      {!active ? (
        <button
          className="border-slate-200 flex gap-2 items-center px-2 py-2 text-black text-sm border rounded-lg"
          onClick={() => setShowWalletConnector(true)}
        >
          <SvgContainer name="wallet" />
          {t('connect-wallet')}
        </button>
      ) : (
        <Dropdown
          Selector={({ isOpen }) => (
            <div className="border-slate-20 flex items-center pl-2 pr-1 py-2 text-black text-sm border rounded-xl">
              {shortenedAccount}
              <SvgContainer
                className={`w-6 h-6 fill-current ${
                  isOpen ? 'transform rotate-180' : ''
                }`}
                name="caret"
              />
            </div>
          )}
          className="text-gray-600 cursor-pointer"
        >
          <ul
            className="absolute z-10 mt-1 p-2 w-40 text-center bg-white rounded-xl shadow-lg"
            onClick={deactivateConnector}
          >
            {t('disconnect')}
          </ul>
        </Dropdown>
      )}
    </>
  )
}

export default Wallet
