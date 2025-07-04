// Import necessary components from react-router-dom and other parts of the application.
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";  // Custom hook for accessing the global state.
import { useEffect, useState, useRef } from "react";
import userServices from "../services/flux";
import "../styles/Games.css";
import { NavbarVisitor } from "../components/NavbarVisitor";
import storeServices from "../services/fluxApis";
import { UserLogueado } from "../components/UserLogueado";
import { House, MagnifyingGlass, Gear, Globe, GameController, PuzzlePiece, User, CaretLeft, CaretRight, DeviceMobile, DesktopTower, Monitor, AppleLogo, AndroidLogo, SignOut, Clock, Calendar, ShoppingCart } from "phosphor-react";
import anime from "animejs";
import botones from './../assets/botones.mp3'
import Botonsiguiente from './../assets/Botonsiguiente.mp3'
import { useNavigate } from "react-router-dom";
import { BoardGames } from "./BoardG";
import accionImg from "../assets/img/Accion.png";
import adventureImg from "../assets/img/Adventure.png";
import puzzleImg from "../assets/img/Puzzle.png";
import RacinImg from "../assets/img/Racin.png";
import shooterImg from "../assets/img/Shooter.png";
import sportImg from "../assets/img/Sport.png";
import rpgImg from "../assets/img/RPG.png";
import strategyImg from "../assets/img/Strategy.png";
import stripeServices from "../services/fluxStore";
import { getStoredUser } from "../utils/storage";
import { handleFavoriteClick } from "../utils/favoriteUtils.js";
import { handleAddToCart } from "../utils/CartUtils.js"
import { CartModal } from "../components/CartModal.jsx";

export const Games = () => {



  // Access the global state and dispatch function using the useGlobalReducer hook.
  const {
    store,
    dispatch,
  } = useGlobalReducer();

  const { videojuegos, cart } = store;





  const [page, setPage] = useState(1)



  const [cargando, setCargando] = useState(false)
  const [showSearchCanvas, setShowSearchCanvas] = useState(false);
  const [clickedCard, setClickedCard] = useState(null);
  const [activeGenre, setActiveGenre] = useState(null);
  const [genreGames, setGenreGames] = useState([]);
  const [activePlatform, setActivePlatform] = useState(null);

  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [gameName, setGameName] = useState("")



  const user = getStoredUser();
  const username = user?.username

  // useEffect(() => {
  //   if (!activeGenre && !activePlatform) {
  //     // Caso general
  //     storeServices.videojuegos(page).then((data) =>
  //       dispatch({ type: "load_videojuegos", payload: data })
  //     );
  //   } else {
  //     // Caso filtrado → llamar getRecomendados con page
  //     storeServices.getRecomendados({
  //       genre_slug: activeGenre,
  //       platform_id: activePlatform,
  //       page: page
  //     }).then((data) => {
  //       setGenreGames(data);
  //     });
  //   }
  // }, [page, activeGenre, activePlatform, dispatch]);


  const showCartModal = (name) => {
    setGameName(name);
    setShowModal(true);
  }






  //   useEffect(() => {
  //     const sessionID = store.sessionID || localStorage.getItem('activeSessionID');
  //     if (sessionID) {
  //       openAiServices.getIAsession(sessionID);
  //     } else {
  //       console.warn("No hay sessionID definido");
  //     }
  // }, [])

  const audioBotones = useRef(new Audio(botones));
  const hoverSoundRef = useRef(new Audio(Botonsiguiente));

  const playHoverSound = () => {
    const sound = hoverSoundRef.current;
    sound.currentTime = 0; // 🔥 Esta línea es clave
    sound.play().catch(e => {
      console.log("Playback prevented:", e);
    });
  };

  // AQUI EMPIEZA LOS RECUADROS DE ARRIBA//

  const handleMouseEnter = (e) => {

    anime.remove(e.currentTarget);
    audioBotones.current.play();

    anime({
      targets: e.currentTarget,
      translateY: [
        { value: -44, easing: "easeOutExpo", duration: 600 },
        { value: 0, easing: "easeOutBounce", duration: 800, delay: 100 }
      ],

      rotate: {
        value: "-1turn", // ✅ Gira completamente
        duration: 1000,
        easing: "easeInOutSine"

      },
      delay: 0

    });

  };

  const handleMouseLeave = (e) => {
    anime.remove(e.currentTarget);

    anime({
      targets: e.currentTarget,
      translateY: 0,
      rotate: 0, // ✅ Asegura que vuelve al ángulo original
      scale: 1,
      duration: 400,
      easing: "easeOutQuad"
    });

  };

  const userIsLoggedIn = !!getStoredUser();

  const items = [
    { icon: <House size={32} weight="fill" />, label: "Home", route: "/" },
    { icon: <MagnifyingGlass size={32} weight="fill" />, label: "Search" },
    ...(userIsLoggedIn
      ? [{
        icon: <Globe size={32} weight="fill" />, label: "OnlineGames", route: "/onlinegames"
      }] : []),
    // { icon: <GameController size={32} weight="fill" />, label: "Videogames" },
    { icon: <PuzzlePiece size={32} weight="fill" />, label: "Boardgames", route: "/boardgames" },
    { icon: <ShoppingCart size={32} weight="fill" />, label: "Cart", route: "/cart" },
    { icon: <User size={32} weight="fill" />, label: "Profile", route: "/userprofile" },
    ...(userIsLoggedIn
      ? [{
        icon: <SignOut size={32} weight="fill" />, label: "SignOut", action: () => { dispatch({ type: 'logout' }), navigate('/') }
      }] : [])

  ];

  const handleCardClick = (route, label, action) => {
    if (action) return action();

    const user = getStoredUser();
    if (label === "Search") {
      new window.bootstrap.Offcanvas("#staticBackdrop").show();
      return;
    }
    if (label === "Profile" && !user) return navigate("/signin");
    route && navigate(route);
  };
  // ------------------------  filtrado por género  -------------------- //
  const handleGenreClick = async (slug) => {
    try {
      setCargando(true);
      setActiveGenre(slug);
      setActivePlatform(null);  // reseteo plataforma
      setPage(1);
      const data = await storeServices.getRecomendados({
        genre_slug: slug,
        platform_id: null,
        page: 1
      });
      setGenreGames(data);
    } finally {
      setCargando(false);
    }
  };

  const clearGenre = () => {
    setActiveGenre(null);
    setActivePlatform(null);
    setGenreGames([]);

  };

  const juegosParaMostrar = (activeGenre || activePlatform) ? genreGames : videojuegos;






  // -----------------------  array de géneros  ------------------------ //
  const genres = [

    { slug: "action", label: "Action", icon: accionImg },
    { slug: "adventure", label: "Adventure", icon: adventureImg },
    { slug: "puzzle", label: "Puzzle", icon: puzzleImg },
    { slug: "shooter", label: "Shooter", icon: shooterImg },
    { slug: "sports", label: "Sports", icon: sportImg },
    { slug: "role-playing-games-rpg", label: "RPG", icon: rpgImg },
    { slug: "strategy", label: "Strategy", icon: strategyImg },
    { slug: "racing", label: "Racing", icon: RacinImg },


  ];

  const platforms = [
    { id: 187, label: "PlayStation 5", icon: <GameController size={20} weight="bold" /> },
    { id: 186, label: "Xbox Series X", icon: <GameController size={20} weight="bold" /> },
    { id: 7, label: "Nintendo Switch", icon: <GameController size={20} weight="bold" /> },
    { id: 4, label: "PC", icon: <DesktopTower size={20} weight="bold" /> },


  ];

  const handlePlatformClick = async (platform_id) => {
    try {
      setCargando(true);
      setActivePlatform(platform_id);
      setActiveGenre(null);  // reseteo género
      setPage(1);
      const data = await storeServices.getRecomendados({
        genre_slug: null,
        platform_id: platform_id,
        page: 1
      });
      setGenreGames(data);
    } finally {
      setCargando(false);
    }
  };






  // AQUI TERMINA LOS RECUADROS DE ARRIBA//

  const handleClickCard = (id) => {
    setClickedCard(id);
    setTimeout(() => setClickedCard(null), 500); // Glitch dura 500ms
  };

  useEffect(() => {
    const fetchGames = async () => {
      const juegosApi = (activeGenre || activePlatform)
        ? await storeServices.getRecomendados({
          genre_slug: activeGenre,
          platform_id: activePlatform,
          page: page
        })
        : await storeServices.videojuegos(page);

      const storeItems = await stripeServices.getItemsFromStore();

      const juegosConPrecio = juegosApi.map(game => {
        const item = storeItems.find(si => si.game_api_id === game.id);
        return {
          ...game,
          stripe_price_id: item ? item.stripe_price_id : null,
        }
      })

      if (activeGenre || activePlatform) {
        setGenreGames(juegosConPrecio)
      } else {
        dispatch({ type: "load_videojuegos", payload: juegosConPrecio })
      }

    }
    fetchGames()
  }, [page, activeGenre, activePlatform, dispatch])

  // const handleClick = () => {
  //   navigate('/cart')
  // }


  const isFavorite = (gameId) => {
    return store.user?.favorites?.some(fav => fav.id === gameId);
  }; console.log("user", user);

  console.log("Es favorito:", isFavorite());

  const isInCart = (gameId) =>
    cart?.some(item => item.game_api_id === gameId || item.id === gameId);

  return (
    <div className="fondoGames">
      {/* ───────── GRID SUPERIOR ───────── */}
      <div className="container">
        <div className="ps5-grid">
          {items.map(({ icon, label, route, action }, i) => (
            <div
              key={i}
              className="char ps5-card cyber-card"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleCardClick(route, label, action)}
            >
              <div className="icon">{icon}</div>
              <span className="label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ───────── SIDEBAR CYBERPUNK ───────── */}
      <div
        id="staticBackdrop"
        className="offcanvas offcanvas-start sidebar-cyber"
        data-bs-backdrop="static"
        tabIndex="-1"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">
            {getStoredUser()?.username || "Guest"}
          </h5>
          <button className="btn-close bg-white" data-bs-dismiss="offcanvas" />
        </div>

        <div className="offcanvas-body">
          {/* Cesta */}
          {/* <div className="discover-sidebar__menu">
            <button className="discover-sidebar__title btn-reset" onClick={handleClick}>
              Cesta
            </button>
          </div> */}
          {/* ALL GAMES */}
          <div className="discover-sidebar__menu">
            <button className="discover-sidebar__title btn-reset" onClick={clearGenre}>
              All Games
            </button>
          </div>

          {/* GENRES */}
          <div className="discover-sidebar__menu">
            <span className="discover-sidebar__title">Genres</span>
            <ul className="discover-sidebar__list">
              {genres.map(({ slug, label, icon }) => (
                <li key={slug} className="discover-sidebar__item">
                  <button
                    className={`discover-sidebar__link btn-reset ${activeGenre === slug ? "active-genre" : ""}`}
                    onClick={() => handleGenreClick(slug)}
                  >
                    <img className="genre-icon" src={icon} alt={label} />
                    <span className="discover-sidebar__label">{label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* PLATFORMS */}
          <div className="discover-sidebar__menu">
            <span className="discover-sidebar__title">Platforms</span>
            <ul className="discover-sidebar__list">
              {platforms.map(({ slug, label, icon, id }) => (
                <li key={id} className="discover-sidebar__item">
                  <button
                    className={`discover-sidebar__link btn-reset ${activePlatform === id ? "active-genre" : ""}`}
                    onClick={() => handlePlatformClick(slug)}
                  >
                    <span className="icon">
                      {icon} {/* Aquí te pongo icono Phosphor */}
                    </span>
                    <span className="discover-sidebar__label">{label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ───────── LISTA DE JUEGOS ───────── */}
      {cargando ? (
        <div className="loading neon-text">Cargando…</div>
      ) : (
        <div className="game-list">
          {juegosParaMostrar.map((e) => {
            let alreadyInCart = false;
            if (Array.isArray(store.cart)) {
              alreadyInCart = store.cart.some(item => item.id === e.id)
            }
            return (
              <div
                key={e.id}
                className="game-card glitch-bg"
                style={{ "--background-url": `url(${e.background_image})` }}
              >
                <div className="game-info">
                  <h2 className="game-title neon-text">{e.name}</h2>
                  <p className="game-description">{e.rating}⭐</p>
                  {e.stripe_price_id ? (
                    <>
                      <button className="game-button" onClick={async () => {
                        await handleAddToCart(e, cart, dispatch, navigate, showCartModal)
                      }}
                      >{isInCart(e.id) ? <span className="fa-solid fa-cart-shopping"></span> : <span className="fa-solid fa-cart-plus"></span>}</button>
                      <CartModal isOpen={showModal} onClose={() => setShowModal(false)} gameName={gameName} />
                    </>
                  ) : (
                    <button className="game-buttons" disabled><Clock size={27} /></button>
                  )}
                  <button
                    className={`game-button ${isFavorite(e.id) ? "favorited" : ""}`}
                    onClick={() => handleFavoriteClick(e, dispatch, navigate)}
                  >
                    {isFavorite(e.id) ? "❤️" : "🤍"}
                  </button>

                  <Link to={`/games/${e.id}`} className="game-button">
                    Info
                  </Link>
                </div>
              </div>
            )
          })}
          {/* <CartModal open={showModal} onOpenChange={setShowModal} gameName={gameName} /> */}
        </div>
      )}

      {/* ───────── PAGINACIÓN ───────── */}

      <div className="pagination-container">
        <button
          onClick={() => {
            setPage((p) => Math.max(p - 1, 1));
            playHoverSound();
          }}
          disabled={page === 1}
          className={`pagination-button cyber-btn ${page === 1 ? "disabled" : ""}`}
        >
          <CaretLeft size={20} weight="bold" /> Pagina anterior
        </button>
        <span className="pagination-page">Pagina {page}</span>
        <button
          onClick={() => {
            setPage((p) => p + 1);
            playHoverSound();
          }}
          className="pagination-button cyber-btn"
        >
          Pagina siguiente <CaretRight size={20} weight="bold" />
        </button>
      </div>

    </div>
  );

};
