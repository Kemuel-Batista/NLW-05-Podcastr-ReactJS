import '../styles/global.scss';

import { Header } from '../components/Header'
import { Player } from '../components/Player';

import { PlayerContextProvider, usePlayer } from '../contexts/PlayerContext';

import styles from '../styles/app.module.scss';
import { useMediaQuery } from '../utils/UseMediaQuery';

function MyApp({ Component, pageProps }) {
  const isBreakpoint = useMediaQuery(600);

  const { isFull } = usePlayer();

  return (
    <PlayerContextProvider>
      <div className={styles.wrapper}>
        {
          isBreakpoint ? (
            <>
            {
              isFull ? (
                <Player />
              ) : (
                <main>
                  <Header /> 
                  <Component {...pageProps} />
                  <Player />
                </main>
              )
            }
            </> 
          ) : (
          <>
            <main>
              <Header /> 
              <Component {...pageProps} />
            </main>
            <Player />
          </>
          )
        }
      </div>
    </PlayerContextProvider>

  )
}

export default MyApp
