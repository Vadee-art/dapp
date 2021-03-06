/* eslint-disable no-nested-ternary */
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import Hidden from '@mui/material/Hidden';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@mui/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import LoadingButton from '@mui/lab/LoadingButton';
import { Typography, Button, Container, Divider, Card } from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import {
  fetchAllArtWorks,
  fetchCategories,
  fetchOneArtWork,
} from '../actions/artworkAction';
import { addToCart } from '../actions/cartAction';
import TheTab from '../components/TheTab';
import {
  favArtistChange,
  favArtworkChange,
  openAuthDialog,
} from '../actions/userAction';
import RelatedCategory from '../components/carousel/RelatedCategory';
// import CarouselArtist from '../components/carousel/CarouselArtist';
import {
  ARTWORK_DETAILS_RESET,
  ARTWORK_UPDATE_RESET,
} from '../constants/artworkConstants';
import {
  MINT_AND_REDEEM_RESET,
  SIGN_MY_ITEM_RESET,
} from '../constants/lazyFactoryConstants';
import {
  fetchArtistById,
  fetchArtistRelatedArt,
  fetchArtistList,
  fetchSimilarArtists,
} from '../actions/artistAction';
import CarouselArtistSimilarArtworks from '../components/carousel/CarouselArtistSimilarArtworks';
import CarouselArtistArtworks from '../components/carousel/CarouselArtistArtworks.jsx';
import CarouselRelatedArtistOne from '../components/carousel/CarouselRelatedArtist-1';
import { ARTIST_BY_ID_RESET } from '../constants/artistConstants';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    minHeight: '100vh',
    marginBottom: 100,
  },
  container: {
    display: 'Grid',
  },
  paper: {
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingTop: '16px',
    paddingBottom: '16px',
    marginLeft: theme.spacing(2),
    position: 'relative',
  },
}));

// match params has the id from the router /:workId
function Artwork() {
  window.scrollTo(0, 0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { workId } = useParams();

  const [isDisabled, setIsDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [priceEth, setPriceEth] = useState();
  const [isFavoriteArtwork, setIsFavoriteArtwork] = useState(false);
  const [isFavoriteArtist, setIsFavoriteArtist] = useState(false);

  const categoryList = useSelector((state) => state.categoryList);
  const { categories } = categoryList;

  const theArtwork = useSelector((state) => state.theArtwork);
  const { error, loading: loadingArtwork, artwork } = theArtwork;

  const theArtist = useSelector((state) => state.theArtist);
  const { artist, relatedTags, relatedArtists } = theArtist;

  const artistList = useSelector((state) => state.artistList);
  const { artists, success: successArtistList } = artistList;

  const theCart = useSelector((state) => state.theCart);
  const { loading: loadingCart } = theCart;

  const userDetails = useSelector((state) => state.userDetails);
  const { user, success: successUserDetails } = userDetails;

  const favArtwork = useSelector((state) => state.favArtwork);
  const { success: successFavArtwork } = favArtwork;

  const favArtist = useSelector((state) => state.favArtist);
  const { success: successFavArtist } = favArtist;

  // loading button
  useEffect(() => {
    if (loadingCart) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [loadingCart]);

  // fetch artwork if not success
  useEffect(() => {
    if (workId) {
      dispatch(fetchOneArtWork(workId));
      dispatch(fetchCategories());
    }
    return () => {
      dispatch({ type: ARTWORK_DETAILS_RESET });
      dispatch({ type: ARTIST_BY_ID_RESET });
    };
  }, [dispatch, workId]);

  // fetch artist
  useEffect(() => {
    if (artwork.artist) {
      dispatch(fetchArtistRelatedArt(artwork.artist._id));
      dispatch(fetchSimilarArtists(artwork.artist._id));
      dispatch(fetchArtistById(artwork.artist._id));
      if (!successArtistList) dispatch(fetchArtistList());
    }
  }, [artwork]);

  // quantity = 0
  useEffect(() => {
    if (artwork && artwork.quantity < 1) {
      setIsDisabled(true);
    }
    if (
      artwork &&
      !artwork.is_sold_out &&
      artwork.voucher &&
      artwork.voucher.signature
    ) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [artwork]);

  // convert price to ETH
  useEffect(() => {
    if (artwork && artwork.voucher && artwork.voucher.artwork_id) {
      const convertedPrice = ethers.utils.formatEther(
        artwork.voucher.price_wei
      );
      setPriceEth(convertedPrice);
    }
  }, [artwork]);

  // after fav
  useEffect(() => {
    if (successFavArtwork || successFavArtist) {
      dispatch(fetchOneArtWork(workId));
    }
  }, [successFavArtwork, successFavArtist]);

  // check if is fav
  useEffect(() => {
    if (user && artwork.favorite_artworks) {
      const isFavArt = artwork.favorite_artworks.find(
        (userId) => userId === user.id
      );
      setIsFavoriteArtwork(isFavArt);
    }
    if (user && artist && artist.artist && artist.artist.favorites) {
      const isFavArtist = artist.artist.favorites.find(
        (userId) => userId === user.id
      );
      setIsFavoriteArtist(isFavArtist);
    }
  }, [artwork, artist]);

  const onAddToCart = () => {
    dispatch({ type: MINT_AND_REDEEM_RESET });
    dispatch({ type: ARTWORK_UPDATE_RESET });
    dispatch({ type: SIGN_MY_ITEM_RESET });

    dispatch(addToCart(workId));
    navigate(`/cart/shippingAddress/${workId}?title=${artwork.title}`);
  };

  // fav artist
  const handleFavoriteArtist = (artistId) => {
    if (!user) {
      dispatch(openAuthDialog('login'));
    } else {
      dispatch(favArtistChange(artistId));
    }
  };

  // fav artwork
  const handleFavoriteArtwork = (artworkId) => {
    if (!user) {
      dispatch(openAuthDialog('login'));
    } else {
      dispatch(favArtworkChange(artworkId));
    }
  };

  const classes = useStyles();
  const renderElement = () => (
    <Container maxWidth="xl">
      {artists &&
        artist &&
        artist.artworks &&
        categories &&
        artwork &&
        artwork.price && (
          <>
            <Grid
              container
              direction="row"
              justifyContent="flex-start"
              sx={{ mt: 4 }}
            >
              <Grid
                container
                justifyContent="flex-end"
                alignItems={window.innerWidth < 600 ? 'center' : 'flex-start'}
                direction="column"
                item
                xs={12}
                md={1}
                sx={{ marginLeft: 2, marginRight: 2 }}
              >
                <Grid>
                  <Button
                    size="small"
                    onClick={() => handleFavoriteArtwork(artwork._id)}
                    sx={{
                      fontSize: 15,
                      textTransform: 'none',
                      textAlign: 'left',
                    }}
                  >
                    {!isFavoriteArtwork ? 'Save' : 'Unsave'}
                  </Button>
                </Grid>
                <Grid>
                  <Button
                    size="small"
                    sx={{
                      fontSize: 15,
                      textTransform: 'none',
                    }}
                  >
                    Share
                  </Button>
                </Grid>
              </Grid>
              <Grid item xs sx={{ textAlign: 'center', margin: 'auto' }}>
                <Paper className={classes.paper} elevation={0}>
                  <Link
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                    }}
                    to={`/artists/${artist.artist._id}`}
                  />
                  <img
                    onLoad={() => setIsImageLoading(true)}
                    src={`${artwork.image}?w=248&fit=crop&auto=format`}
                    srcSet={`${artwork.image}?w=248&fit=crop&auto=format&dpr=2 2x`}
                    alt="Art work"
                    style={{ width: '100%', maxWidth: '500px' }}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Grid container direction="row" alignItems="center" spacing={2}>
                  <Grid item xs={6} md={2}>
                    <img
                      src={`${artwork.artist.photo}?w=24&fit=crop&auto=format`}
                      style={{ maxWidth: '100%' }}
                      srcSet={`${artwork.artist.photo}?w=24&fit=crop&auto=format&dpr=1 x`}
                      alt="artist"
                    />
                  </Grid>
                  <Grid
                    item
                    container
                    direction="column"
                    justifyContent="flex-end"
                    alignItems="flex-start"
                    xs={6}
                    md={10}
                    sx={{ position: 'relative' }}
                  >
                    <Grid item xs>
                      <Typography variant="subtitle2">
                        {artwork.artist &&
                          `${artwork.artist.first_name} ${artwork.artist.last_name}`}
                      </Typography>
                      <Typography>
                        {artwork.artist &&
                          `${artwork.artist.origin.country}, ${artwork.artist.birthday}`}
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      sx={{
                        width: '50%',
                      }}
                    >
                      <Button
                        variant="contained"
                        type="submit"
                        sx={{
                          backgroundColor: '#A2A28F',
                          color: 'black',
                          lineHeight: '0.4rem',
                          '&:hover': {
                            backgroundColor: 'black',
                          },
                          width: '100%',
                        }}
                        disabled={isDisabled}
                        onClick={() => handleFavoriteArtist(artist.artist._id)}
                      >
                        {!isFavoriteArtist ? 'Follow' : 'UnFllow'}
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
                <Divider
                  className={classes.divider}
                  style={{ marginTop: 20, marginBottom: 20 }}
                />
                <Grid item>
                  <Typography color="#666666" variant="h5">
                    {artwork.title}
                  </Typography>
                  <Typography color="#666666" variant="body2">
                    {artwork.subtitle}
                  </Typography>
                  <Typography color="#666666" variant="body2">
                    {artwork.year}
                  </Typography>
                  <Typography color="#666666" variant="body2">
                    {artwork.medium}
                  </Typography>
                  <Typography color="#666666" variant="body2">
                    {artwork.unit === '0' && ' in '}
                    {artwork.unit === '1' && ' cm '}
                    {!artwork.unit && ' cm '}
                    <span
                      style={{
                        position: 'absolute',
                        direction: 'ltr',
                        paddingRight: 2,
                      }}
                    >
                      {artwork.width} x {artwork.height}
                    </span>
                  </Typography>
                  {artwork.edition_number > 0 && (
                    <Typography variant="body2">
                      {artwork.edition_number} from {artwork.edition_total}
                    </Typography>
                  )}
                  <Typography color="#666666" variant="body2">
                    {`${
                      !artwork.is_sold_out
                        ? artwork.edition_total - artwork.edition_number + 1
                        : 0
                    } Remaining`}
                  </Typography>
                </Grid>
                <Divider
                  className={classes.divider}
                  style={{ marginTop: 20, marginBottom: 10 }}
                />
                <Grid item container>
                  <Grid
                    item
                    md={8}
                    container
                    direction="column"
                    justifyContent="flex-start"
                    alignItems="flex-start"
                  >
                    <Grid item>
                      <Typography variant="h6">
                        {artwork.voucher.artwork_id
                          ? ` ??  ${priceEth}`
                          : `$ ${artwork.price.toLocaleString()}`}
                      </Typography>
                    </Grid>
                    <Grid item sx={{ mt: 2, width: '100%' }}>
                      <LoadingButton
                        loading={isLoading}
                        onClick={(e) => onAddToCart(e)}
                        variant={!successUserDetails ? 'outlined' : 'contained'}
                        type="submit"
                        fullWidth
                        disabled={isDisabled}
                      >
                        {successUserDetails
                          ? 'Purchase Artwork'
                          : 'Login To Purchase'}
                      </LoadingButton>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="flex-start"
              alignItems="baseline"
            >
              <Hidden mdDown>
                <Grid item xs={1} sx={{ position: 'relative', marginLeft: 3 }}>
                  <Typography variant="subtitle2" sx={{ marginTop: 5 }}>
                    {artwork &&
                      artwork.artist &&
                      `${artwork.artist.first_name}`}{' '}
                    <br />
                    {artwork &&
                      artwork.artist &&
                      `${artwork.artist.last_name}`}{' '}
                    <br />
                    <Button
                      variant="contained"
                      type="submit"
                      sx={{
                        backgroundColor: '#A2A28F',
                        color: 'black',
                        marginTop: 1,
                        lineHeight: '0.4rem',
                        '&:hover': {
                          backgroundColor: 'black',
                        },
                      }}
                      disabled={isDisabled}
                      onClick={() => handleFavoriteArtist(artist.artist._id)}
                    >
                      {!isFavoriteArtist ? 'Follow' : 'UnFllow'}
                    </Button>
                  </Typography>
                </Grid>
              </Hidden>
              <Grid item xs={12} sm={6}>
                <Card sx={{ minHeight: '400px' }} elevation={0}>
                  <TheTab artist={artwork.artist} />
                </Card>
              </Grid>
            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="flex-start"
              alignItems="flex-start"
              sx={{
                marginTop: 8,
              }}
            >
              <CarouselArtistArtworks artist={artist} />
            </Grid>
            <Grid sx={{ paddingLeft: 2, paddingRight: 2 }}>
              <RelatedCategory categories={categories} />
            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="center"
              alignItems="baseline"
              sx={{
                marginTop: 8,
              }}
            >
              {relatedTags && (
                <CarouselArtistSimilarArtworks relatedTags={relatedTags} />
              )}
            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="center"
              alignItems="baseline"
              sx={{
                marginTop: 8,
              }}
            >
              {relatedArtists && (
                <CarouselRelatedArtistOne relatedArtists={relatedArtists} />
              )}
            </Grid>
          </>
        )}
    </Container>
  );

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        {loadingArtwork ? (
          <Loader />
        ) : error ? (
          <Message variant="outlined" severity="error">
            {error}
          </Message>
        ) : (
          renderElement()
        )}
      </Grid>
    </div>
  );
}

export default Artwork;
