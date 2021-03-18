(() => {
  const assets = {
    grass: {
      level: 1,
      src: '/assets/grass.png',
      label: 'Grass'
    },
    sand: {
      level: 1,
      src: '/assets/sand.png',
      label: 'Sand'
    },
    barrel: {
      level: 2,
      src: '/assets/barrel.png',
      label: 'Barrel'
    },
    tree: {
      level: 2,
      src: '/assets/tree.png',
      label: 'Tree'
    },
  };
  const assetsPaneEl = document.getElementById('assets-pane');
  const mapPanelEL = document.getElementById('map-pane');
  const widthEl = document.getElementById('map-size-width');
  const heightEl = document.getElementById('map-size-height');
  let mapConfig = {
    size: {
      width: 15,
      height: 10,
    },
    items: [],
  };

  /**
   * Renders the left pane, add layer items.
   */
  function renderAssetLayer() {
    Object.keys(assets).forEach(asset => {
      const assetInfo = assets[asset];
      const assetEl = document.createElement('img');

      addClass(assetEl, 'asset-item');
      elementData(assetEl, 'asset', asset);
      assetEl.src = assetInfo.src;
      assetEl.title = assetInfo.label;

      assetsPaneEl.appendChild(assetEl);
      assetEl.addEventListener('click', () => {
        const el = getActiveTileElement();

        if (!el) {
          return alert('Please select a tile to apply the layer on');
        }

        const coords = parseCoordsFromTileHTMLElement(el);

        addAsset(coords, asset);
        renderMap();
        setActiveTile(coords);
      });
    });
  }

  /**
   * Render the map pane, create tiles, and set layers.
   */
  function renderMap() {
    const { width, height } = mapConfig.size;

    // Clear children
    mapPanelEL.innerHTML = '';

    // We also need to arrange the boxes
    mapPanelEL.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
    mapPanelEL.style.gridTemplateRows = `repeat(${height}, 1fr)`;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        createTile({ x, y });
        renderCoordsLayer({ x, y });
      }
    }
  }

  /**
   * Renders the layers of the given coordinate.
   *
   * @param {*} coords
   */
  function renderCoordsLayer(coords) {
    const tileEl = getTileElementByCoords(coords);

    if (tileEl) {
      tileEl.innerHTML = '';
      const item = mapConfig.items.find(({ x, y }) => coords.x === x && coords.y === y);

      if (item) {
        Object.keys(item.layers).forEach(level => {
          const { asset } = item.layers[level];
          const el = document.createElement('img');

          el.src = assets[asset].src;
          tileEl.appendChild(el);
        });
      }
    }
  }

  /**
   * Prefill and listen to form
   */
  function setupMapSize() {
    const form = document.getElementById('map-size-form');
    const { size } = mapConfig;

    // Handle form submission
    form.onsubmit = (e) => {
      e.preventDefault();
      setMapSize(+widthEl.value, +heightEl.value);
      removeOutboundedTiles();
      renderMap();
      setActiveTile({ x: 0, y: 0 });
    }

    // Pre-fill the form inputs
    widthEl.value = size.width;
    heightEl.value = size.height;
  }

  /**
   * Add the asset to the given coordinate.
   *
   * @param {*} coords
   * @param {string} layer
   */
  function addAsset(coords, asset) {
    const items = mapConfig.items.slice();
    const index = mapConfig.items.findIndex(({ x, y }) => coords.x === x && coords.y === y);
    const assetInfo = assets[asset];
    const data = index === -1 ? {
      ...coords,
      layers: {},
    } : items[index];

    // Set the asset for the layer level
    data.layers[assetInfo.level] = { asset };

    if (index === -1) {
      items.push(data);
    } else {
      items[index] = data;
    }

    mapConfig.items = items;
  }

  /**
   * Creates a tile element and add it to the map pane.
   *
   * @param {*} tileInfo
   */
  function createTile(tileInfo) {
    const { x, y } = tileInfo;
    const tileEl = document.createElement('div');

    addClass(tileEl, 'tile');
    elementData(tileEl, 'coords', `${x},${y}`);
    mapPanelEL.appendChild(tileEl);
    // When a tile is clicked, let's make is as the active tile
    tileEl.addEventListener('click', () =>
      setActiveTile(parseCoordsFromTileHTMLElement(tileEl))
    )
  }

  function removeOutboundedTiles() {
    const { size: { width, height } } = mapConfig;
    const filterOutbounded = ({ x, y }) => x < width && y < height;

    mapConfig.items = mapConfig.items.filter(filterOutbounded);
  }

  /**
   * Sets the map size.
   *
   * @param {number} width
   * @param {number height
   */
  function setMapSize(width, height) {
    mapConfig.size.width = width;
    mapConfig.size.height = height;
  }

  /**
   * Set the active tile
   */
  function setActiveTile(coords) {
    const { x, y } = coords;

    // Unset old active
    const active = getActiveTileElement();
    if (active) {
      removeClass(active, 'active');
    }

    addClass(mapPanelEL.querySelector(`[data-coords='${x},${y}']`), 'active')
  }

  /**
   * Get the active tile HTMLElement
   */
  function getActiveTileElement() {
    return mapPanelEL.querySelector('.active');
  }

  /**
   * Get the tile element by coordinates.
   *
   * @param {*} coords
   */
  function getTileElementByCoords({ x, y }) {
    return mapPanelEL.querySelector(`[data-coords='${x},${y}']`);
  }

  /**
   * Parse the coordinates of the given tile HTMLElement.
   *
   * @param {HTMLElement} tileEL
   */
  function parseCoordsFromTileHTMLElement(tileEL) {
    const [x, y] = elementData(tileEL, 'coords').split(',');

    return { x: +x, y: +y };
  }

  /**
   * Add class(es) to the given HTMLElement.
   *
   * @param {HTMLElement} el
   * @param {string[]} cls
   */
  function addClass(el, cls) {
    cls = typeof cls === 'string' ? [cls] : cls;

    if (el) {
      el.classList.add(...cls);
    }
  }

  /**
   * Remove class(es) from the given HTMLElement.
   *
   * @param {HTMLElement} el
   * @param {string[]} cls
   */
  function removeClass(el, cls) {
    cls = typeof cls === 'string' ? [cls] : cls;

    if (el) {
      el.classList.remove(...cls)
    }
  }

  /**
   * Set if value is not undefined, get otherwise.
   *
   * @param {HTMLElement} el
   * @param {string} key
   * @param {string} value
   */
  function elementData(el, key, value) {
    if (el) {
      if (typeof value === 'undefined') {

        return el.dataset[key];
      }

      el.dataset[key] = value;
    }
  }

  function onImportClick(e) {
    e.preventDefault();
    const importInput = document.getElementById('import-input');

    importInput.click();

    importInput.onchange = async (event) => {
      const file = event.target.files[0];

      try {
        mapConfig = JSON.parse(await file.text());

        setupMapSize();
        renderMap();
      } catch (e) {
        alert('Error importing file: ' + e.message);
      }
    }
  }

  function onExportClick(e) {
    e.preventDefault();
    const dlEl = document.getElementById('download-anchor');
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mapConfig));

    dlEl.setAttribute('href', dataStr);
    dlEl.setAttribute('download', 'map-config.json');
    dlEl.click();
  }

  /**
   * Initialization
   */
  function init() {
    renderAssetLayer();
    setupMapSize();
    renderMap();
    setActiveTile({ x: 0, y: 0 });

    document.getElementById('import-btn').addEventListener('click', onImportClick);
    document.getElementById('export-btn').addEventListener('click', onExportClick);
  }

  init();
})();
