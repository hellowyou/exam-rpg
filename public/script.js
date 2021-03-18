(() => {
  const boxSize = 16;
  const layers = {
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
  const mapSize = {
    width: 15,
    height: 10,
  }
  const assetsPaneEl = document.getElementById('assets-pane');
  const mapPanelEL = document.getElementById('map-pane');

  function renderAssetLayer() {
    Object.keys(layers).forEach(layer => {
      const layerInfo = getLayer(layer);
      const layerEl = document.createElement('img');

      layerEl.classList.add('asset-item', 'asset');
      layerEl.src = layerInfo.src;
      layerEl.title = layerInfo.label;
      layerEl.dataset.layer = layer;

      assetsPaneEl.appendChild(layerEl);

      layerEl.addEventListener('click', () => {
        console.log('layer clicked', layer, layerInfo);
      })
    });
  }

  function renderMap() {
    const { width, height } = mapSize;

    mapPanelEL.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
    mapPanelEL.style.gridTemplateRows = `repeat(${height}, 1fr)`;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        createTile({
          x,
          y,
        })
      }
    }
  }

  function createTile(tileInfo) {
    const { x, y } = tileInfo;
    const tileEl = document.createElement('div');

    tileEl.dataset.x = x;
    tileEl.dataset.y = y;

    tileEl.classList.add('tile');
    console.log('create title', x, y)
    mapPanelEL.appendChild(tileEl);
  }

  function getLayer(layer) {
    return layers[layer];
  }

  function setMapSize(width, height) {
    mapSize.width = width;
    mapSize.height = height;
  }

  function init() {
    renderAssetLayer();
    renderMap();
  }

  init();
})();
