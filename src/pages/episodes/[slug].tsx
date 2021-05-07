import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';

import { GetStaticProps, GetStaticPaths } from 'next';
import { usePlayer } from '../../contexts/PlayerContext';
import { convertDurationToTimeString } from '../../utils/ConvertDurationToTimeString';
import { format, parseISO } from 'date-fns';

import { api } from '../../services/api';

import styles from './episode.module.scss';

type Episode = {
  id:string;
  title: string;
  thumbnail: string; 
  members: string;
  publishedAt: string;
  duration: number;
  durationAsString: string;
  url: string;
  description: string;
}

type EpisodeProps = {
  episode: Episode;
}

export default function Episode({ episode }: EpisodeProps){
  const { play } = usePlayer();

  return (
    <div className={styles.episode}>
      <Head>
        <title>{episode.title} | Podcastr</title>
      </Head>
      <div className={styles.thumbnailContainer}>
        <Link href="/">
          <button type="button">
            <img src="/arrow-left.svg" alt="Voltar"/>
          </button>
        </Link>
        
        <Image 
          width={700}
          height={160}
          src={episode.thumbnail}
          objectFit="cover"
        />

        <button type="button" onClick={() => play(episode)}>
          <img src="/play.svg" alt="Tocar Episodio"/>
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div 
        className={styles.description} 
        dangerouslySetInnerHTML={{ __html: episode.description }} 
      />
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async() => { //SSG (Dynamic)
  const { data } = await api.get('episodes', {
    params: {
      _limit: 2,
      _sort: 'published_at',
      _order: 'desc' 
    }
  })

  const paths = data.map(episode => {
    return {
      params: {
        slug: episode.id
      }
    }
  })

  return {
    paths, // No momento da build nenhuma pag vais er gerada de forma estatica
    fallback: 'blocking' // E o que determina o comportamento de uma pag nao gerada
    // de forma estatica é o fallback, se o fallback for = false, e o paths estiver vazio
    // ele vai retornar o erro 404 e com o blocking ele roda a requisição de buscar os
    // dados do podcast no next.js (node.js) quando ele clicar no link, ele só vai
    // ser redirecionado para outra tela, se estiverem carregados, Melhor opção
  }
}

export const getStaticProps: GetStaticProps = async (ctx) => { // S
  const { slug } = ctx.params;

  const { data } = await api.get(`/episodes/${slug}`);

  const episode = {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
    duration: Number(data.file.duration),
    durationAsString: convertDurationToTimeString(Number(data.file.duration)),
    description: data.description,
    url: data.file.url
  }

  return {
    props: {
      episode
    },
    revalidate: 60 * 60 * 24, // 24 horas
  }
}