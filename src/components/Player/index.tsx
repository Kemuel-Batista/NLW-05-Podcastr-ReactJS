import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import Slider from 'rc-slider';

import 'rc-slider/assets/index.css'

import { usePlayer } from '../../contexts/PlayerContext';

import styles from './styles.module.scss';
import { convertDurationToTimeString } from '../../utils/ConvertDurationToTimeString';
import { useMediaQuery } from '../../utils/UseMediaQuery';
import { FiArrowDown } from 'react-icons/fi';

export function Player(){
  const audioRef = useRef<HTMLAudioElement>(null); // Boa prática iniciar como nulo;
  const [progress, setProgress] = useState(0);
  const isBreakpoint = useMediaQuery(600);

  const { 
    episodeList, 
    currentEpisodeIndex, 
    isPlaying,
    togglePlay,
    toggleLoop,
    toggleShuffle,
    setPlayingState,
    playPrevious,
    playNext,
    hasNext,
    hasPrevious,
    isLooping,
    isShuffling,
    clearPlayerState,
    isFull,
    handleShowUpPlayerFull
 } = usePlayer();

  useEffect(() => {
    if (!audioRef.current){
      return;
    }

    if(isPlaying){
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  function setupProgresListener(){
    audioRef.current.currentTime = 0;

    audioRef.current.addEventListener('timeupdate', () => {
      setProgress(Math.floor(audioRef.current.currentTime));
    })
  }

  function handleSeek(amount: number){
    audioRef.current.currentTime = amount;
    setProgress(amount);  
  }

  function handleEpisodeEnded(){
    if(hasNext){
      playNext();
    } else {
      clearPlayerState();
    }
  }

  function pagePrincipal(){
    return (
    <div className={styles.playerContainer}>
      <header>
        <img src="/playing.svg" alt="Tocando Agora"/>
        <strong>Tocando Agora</strong>
      </header>

      { episode ? (
        <div className={styles.currentEpisode}>
          <Image 
            width={592} height={592}
            src={episode.thumbnail} objectFit="cover"
          />
          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
        </div>
      ): (
        <div className={styles.emptyPlayer}>
          <strong>Selecione um podcast para ouvir</strong>
        </div>
      )}

      <footer className={!episode ? styles.empty : ''}>
        <div className={styles.progress}>
          <span>{convertDurationToTimeString(progress)}</span>
          <div className={styles.slider}>
            { episode ? (
              <Slider 
                max={episode.duration}
                value={progress}
                onChange={handleSeek}
                trackStyle={{ backgroundColor: '#04d361' }}
                railStyle={{ backgroundColor: '#9f75ff' }}
                handleStyle={{ borderColor: '#04d361', borderWidth: 4 }}
              />
            ): (
              <div className={styles.emptySlider} />
            ) }
          </div>
          <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
        </div>

        {episode && (
          <audio 
            src={episode.url}
            ref={audioRef}
            autoPlay
            onEnded={handleEpisodeEnded}
            loop={isLooping}
            onPlay={() => setPlayingState(true)}
            onPause={() => setPlayingState(false)}
            onLoadedMetadata={setupProgresListener}
          />
        )}

        <div className={styles.buttons}>
          <button 
            type="button" 
            disabled={!episode || episodeList.length === 1}
            onClick={toggleShuffle}
            className={isShuffling ? styles.isActive : ''}
          > 
            <img src="/shuffle.svg" alt="Embaralhar"/>
          </button>

          <button type="button" onClick={playPrevious} disabled={!episode || !hasPrevious}>
            <img src="/play-previous.svg" alt="Tocar anterior"/>
          </button>

          <button 
            type="button" 
            className={styles.playButton} 
            disabled={!episode}
            onClick={togglePlay}
          >
            {isPlaying 
              ? <img src="/pause.svg" alt="Pausar"/> 
              : <img src="/play.svg" alt="Tocar"/>
            }
          </button>

          <button type="button" onClick={playNext} disabled={!episode || !hasNext}>
            <img src="/play-next.svg" alt="Tocar próxima"/>
          </button>

          <button 
            type="button" 
            disabled={!episode} 
            onClick={toggleLoop}
            className={isLooping ? styles.isActive : ''}
          >
            <img src="/repeat.svg" alt="Repetir"/>
          </button>
        </div>
      </footer>
    </div>
    )
  }

  function pageResposive(){
    return (
      <div 
        className={isFull || !episode ? styles.playerContainerResponsive : styles.isFullPlayer} 
      >
        { episode ? (
          <>
            {
              isFull && (
                <div className={styles.currentEpisodeResponsive}>
                  <Image 
                    width={592} height={592}
                    src={episode.thumbnail} objectFit="cover"
                  />
                  <strong onClick={handleShowUpPlayerFull}>{episode.title}</strong>
                </div>
              ) 
            }
          </>
          
        ): (
          <div className={styles.emptyPlayerResponsive} onClick={handleShowUpPlayerFull}/>
        )}

        <footer className={!episode ? styles.emptyResponsive : ''}>
          {episode && (
            <audio 
              src={episode.url}
              ref={audioRef}
              autoPlay
              onEnded={handleEpisodeEnded}
              loop={isLooping}
              onPlay={() => setPlayingState(true)}
              onPause={() => setPlayingState(false)}
              onLoadedMetadata={setupProgresListener}
            />
          )}

          <div className={styles.footer}> 
          { episode ? (
              <>
                {
                  isFull ? (
                    <div className={styles.buttonsResponsive}>
                      <button type="button" onClick={playPrevious} disabled={!episode || !hasPrevious}>
                        <img src="/play-previous.svg" alt="Tocar anterior"/>
                      </button>

                      <button 
                        type="button" 
                        className={styles.playButtonResponsive} 
                        disabled={!episode}
                        onClick={togglePlay}
                      >
                        {isPlaying 
                          ? <img src="/pause.svg" alt="Pausar"/> 
                          : <img src="/play.svg" alt="Tocar"/>
                        }
                      </button>

                      <button type="button" onClick={playNext} disabled={!episode || !hasNext}>
                        <img src="/play-next.svg" alt="Tocar próxima"/>
                      </button>
                    </div>
                  ) : (
                    <div className={styles.footerFullContainer}>
                      <div className={styles.buttonLeft} onClick={handleShowUpPlayerFull}>
                        <button type="button">
                          <img src="/arrow-left.svg" alt="Voltar"/>
                        </button>
                        <span>Voltar para Home</span>
                      </div>

                      <div className={styles.currentEpisodeFooter}>
                        <Image 
                          width={592} height={592}
                          src={episode.thumbnail} objectFit="cover"
                        />
                        <strong>{episode.title}</strong>
                        <span>{episode.members}</span>
                      </div>

                      <div className={styles.progressFullPlayer}>
                        <span>{convertDurationToTimeString(progress)}</span>
                        <div className={styles.sliderFullPlayer}>
                          { episode && (
                            <Slider 
                              max={episode.duration}
                              value={progress}
                              onChange={handleSeek}
                              trackStyle={{ backgroundColor: '#04d361' }}
                              railStyle={{ backgroundColor: '#9f75ff' }}
                              handleStyle={{ borderColor: '#04d361', borderWidth: 4 }}
                            />
                          )}
                        </div>
                        <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
                      </div>

                      <div className={styles.buttonsFooter}>
                        <button 
                          type="button" 
                          disabled={!episode || episodeList.length === 1}
                          onClick={toggleShuffle}
                          className={isShuffling ? styles.isActive : ''}
                        > 
                          <img src="/shuffle.svg" alt="Embaralhar"/>
                        </button>

                        <button type="button" onClick={playPrevious} disabled={!episode || !hasPrevious}>
                          <img src="/play-previous.svg" alt="Tocar anterior"/>
                        </button>

                        <button 
                          type="button" 
                          className={styles.playButton} 
                          disabled={!episode}
                          onClick={togglePlay}
                        >
                          {isPlaying 
                            ? <img src="/pause.svg" alt="Pausar"/> 
                            : <img src="/play.svg" alt="Tocar"/>
                          }
                        </button>

                        <button type="button" onClick={playNext} disabled={!episode || !hasNext}>
                          <img src="/play-next.svg" alt="Tocar próxima"/>
                        </button>

                        <button 
                          type="button" 
                          disabled={!episode} 
                          onClick={toggleLoop}
                          className={isLooping ? styles.isActive : ''}
                        >
                          <img src="/repeat.svg" alt="Repetir"/>
                        </button>
                      </div>
                    </div>
                  )
                }
              </>
              ): (
                <div></div>
          )}
          </div>
        </footer>
      </div>
    )
  }

  const episode = episodeList[currentEpisodeIndex]

  return (
    <>
      {
        isBreakpoint ? (
          pageResposive()
        ) : (
          pagePrincipal()
        )
      }
    </>
  )
}