import { register } from 'swiper/element/bundle';
import { useParams } from 'react-router-dom';
import { useGetArtwork } from '../api/getArtwork';
import { Alert } from '@/components/Elements/Alert';
import { Button } from '@/components/Elements';
import { useGetArtist } from '@/features/artist/api/getArtist';
import { ArtworkCard, ArtworkCardSkeleton } from '../components/ArtworkCard';
import { useGetSimilarArtworks } from '@/features/artwork/api/getSimilarArtworks';
import { useAddArtworkToCart } from '@/features/cart/api/addArtworkToCart';
import { useHandleFollowingArtist } from '@/features/artist/hooks/useHandleFollowingArtist';
import { SimilarArtists } from '../components/SimilarArtists';

register();

export const Artwork = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useGetArtwork({ id: +id! });
  const {
    data: artist,
    isLoading: artistLoading,
    error: artistError,
  } = useGetArtist({ id: data?.artist.Id || 0 }, { enabled: !!data });
  const { mutateAsync: addToCart, isLoading: addToCartLoading } = useAddArtworkToCart();
  const { handleFollow, followLoading, unfollowLoading } = useHandleFollowingArtist(data?.artist.Id || 0);

  if (error || artistError) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (isLoading || artistLoading) {
    return <ArtworkSkeleton />;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mt-16 flex flex-col gap-8 md:flex-row">
        <div className="flex-[3]">
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="flex flex-1 flex-col md:self-end">
              <span>Save</span>
              <span>View in Room</span>
              <span>Share</span>
            </div>
            <div className="flex-[4]">
              <img src={data!.image} alt={data!.title} loading="lazy" />
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-8 md:flex-row">
            <div className="flex flex-1 flex-col md:self-start">
              <span>{data!.artist.name}</span>
              <Button variant="gray-olive" className="mt-2 w-full" onClick={() => handleFollow(data!.artist.isFollowing)} isLoading={followLoading || unfollowLoading}>
                {data!.artist.isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
            </div>
            <div className="flex-[4]">
              <h3 className="mb-4 text-sm text-gray-olive-500">
                About the <strong>{data!.title}</strong> artwork{' '}
                {data?.collection ? (
                  <span>
                    from <strong>{data?.collection.title}</strong>
                  </span>
                ) : null}
              </h3>
              <p> {data!.artist.biography} </p>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex flex-row gap-4">
            <img
              src={data!.artist.photo}
              alt="artist photo"
              className="h-24 w-24 bg-gray-300"
              loading="lazy"
            />
            <div className="flex-1">
              <h3>{data!.artist.name}</h3>
              <span>
                {data!.artist.origin.country}, {data!.artist.birthday.split('-')[0]}
              </span>
              <Button size="sm" variant="gray-olive" className="mt-2 w-full" onClick={() => handleFollow(data!.artist.isFollowing)} isLoading={followLoading || unfollowLoading}>
                {data!.artist.isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
            </div>
          </div>
          <hr className="my-4 w-full border-gray-400" />
          <div>
            <h1 className="text-xl font-semibold"> {data!.title} </h1>
            <div className="flex flex-col text-gray-500">
              <span> {data!.year} </span>
              <span>
                {/* TODO: put dynamic unit based on data provided from backend */}
                {data!.width} x {data!.height} cm
              </span>
              <span>
                Limited edition {data!.editionNumber} of {data!.editionTotal}
              </span>
            </div>
          </div>
          <hr className="my-4 w-full" />
          <span className="text-lg font-semibold">${data!.price}</span>
          <Button
            className="mt-4 w-full"
            isLoading={addToCartLoading}
            onClick={async () => {
              if (addToCartLoading) return;
              await addToCart({ artworkId: data!.Id });
            }}
          >
            Buy
          </Button>
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-8 md:flex-row">
        <div className="flex flex-1 flex-col font-extralight text-gray-olive-500 md:self-start">
          {artist?.name} Notable Works
        </div>
        <div className="flex-[6] overflow-hidden">
          <swiper-container space-between="60" slides-per-view="auto" navigation scrollbar>
            {artist?.artworks.map((artwork) => (
              <swiper-slide
                style={{ width: '300px', display: 'flex', paddingBottom: '20px' }}
                key={artwork.Id}
              >
                <ArtworkCard artwork={{...artwork, artist: artist}} />
              </swiper-slide>
            ))}
          </swiper-container>
        </div>
      </div>

      <SimilarArtworks artworkId={data?.Id} />

      <SimilarArtists artistId={data?.artist.Id} />
    </div>
  );
};

export const ArtworkSkeleton = () => {
  return (
    <div className="container mx-auto animate-pulse px-4">
      <div className="mt-16 flex flex-col gap-8 md:flex-row">
        <div className="flex-[3]">
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="flex-1 space-y-4 self-end">
              <div className="h-4 w-24 bg-gray-200" />
              <div className="h-4 w-24 bg-gray-200" />
              <div className="h-4 w-24 bg-gray-200" />
            </div>
            <div className="flex-[4]">
              <div className="h-[400px] w-full bg-gray-200" />
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-8 md:flex-row">
            <div className="flex flex-1 flex-col md:self-start">
              <div className="h-4 w-[100px] bg-gray-200" />
              <div className="h-4 w-[100px] bg-gray-200" />
            </div>
            <div className="flex-[4] space-y-4">
              <div className="h-4 w-4/5 bg-gray-200" />
              <div className="h-4 w-3/5 bg-gray-200" />
              <div className="h-4 w-4/5 bg-gray-200" />
              <div className="h-4 w-3/5 bg-gray-200" />
              <div className="h-4 w-full bg-gray-200" />
              <div className="h-4 w-4/5 bg-gray-200" />
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex flex-row gap-4">
            <div className="h-24 w-24 bg-gray-300"></div>
            <div className="flex-1 space-y-4">
              <div className="h-4 w-[100px] bg-gray-200" />
              <div className="h-8 w-[100px] bg-gray-200" />
            </div>
          </div>
          <hr className="my-4 w-full border-gray-400" />
          <div className="space-y-4">
            <div className="h-4 w-2/3 bg-gray-200" />
            <div className="h-4 w-2/3 bg-gray-200" />
            <div className="h-4 w-2/3 bg-gray-200" />
          </div>
          <hr className="my-4 w-full" />
          <div className="mb-4 h-4 w-[100px] bg-gray-200" />
          <div className="h-12 w-full bg-gray-200" />
        </div>
      </div>
    </div>
  );
};

const SimilarArtworks = ({ artworkId }: { artworkId: number | undefined }) => {
  const {
    data: relatedArtworks,
    isLoading: relatedArtworksLoading,
    error: relatedArtworksError,
  } = useGetSimilarArtworks({ artworkId: artworkId || 0 }, { enabled: !!artworkId });

  if (relatedArtworksError) {
    return <Alert variant="danger">{relatedArtworksError}</Alert>;
  }

  if (relatedArtworksLoading) {
    return (
      <div className="mt-12 flex flex-col gap-8 md:flex-row">
        <div className="flex flex-1 flex-col font-extralight text-gray-olive-500 md:self-start">
          Similar Artworks
        </div>
        <div className="flex-[6] overflow-hidden">
          <swiper-container space-between="60" slides-per-view="auto" navigation scrollbar>
            {Array.from({ length: 3 }, (_) => (
              <swiper-slide style={{ width: '300px', display: 'flex', paddingBottom: '20px' }}>
                <ArtworkCardSkeleton />
              </swiper-slide>
            ))}
          </swiper-container>
        </div>
      </div>
    );
  }

  return (
    <>
      {relatedArtworks?.results && relatedArtworks.results.length > 0 ? (
        <div className="mt-12 flex flex-col gap-8 md:flex-row">
          <div className="flex flex-1 flex-col font-extralight text-gray-olive-500 md:self-start">
            Similar Artworks
          </div>
          <div className="flex-[6] overflow-hidden">
            <swiper-container space-between="60" slides-per-view="auto" navigation scrollbar>
              {relatedArtworks?.results?.map((artwork) => (
                <swiper-slide
                  style={{ width: '300px', display: 'flex', paddingBottom: '20px' }}
                  key={artwork.Id}
                >
                  <ArtworkCard artwork={artwork} />
                </swiper-slide>
              ))}
            </swiper-container>
          </div>
        </div>
      ) : null}
    </>
  );
};
